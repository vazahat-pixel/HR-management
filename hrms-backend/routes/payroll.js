const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Payslip = require('../models/Payslip');
const PayoutReport = require('../models/PayoutReport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SalaryStructure = require('../models/SalaryStructure');
const { authenticate, authorizeAdmin, authorizeEmployee } = require('../middleware/auth');
const { calculateMonthlyPayout } = require('../services/payrollEngine');
const pdfService = require('../services/pdfService');

// GET /api/payroll/salary-structure/:userId — Get salary structure
router.get('/salary-structure/:userId', authenticate, authorizeAdmin, async (req, res) => {
    try {
        let salary = await SalaryStructure.findOne({ userId: req.params.userId });
        if (!salary) {
            // Return empty or default from User model
            const user = await User.findById(req.params.userId);
            salary = {
                userId: req.params.userId,
                baseRate: user?.baseRate || 0,
                conveyance: user?.conveyance || 0,
                incentiveRate: 0,
                tdsRate: 1,
            };
        }
        res.json({ salary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch salary structure.' });
    }
});

// POST /api/payroll/salary-structure/:userId — Update salary structure
router.post('/salary-structure/:userId', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { baseRate, conveyance, otherAllowances, incentiveRate, tdsRate } = req.body;
        const salary = await SalaryStructure.findOneAndUpdate(
            { userId: req.params.userId },
            { baseRate, conveyance, otherAllowances, incentiveRate, tdsRate },
            { upsert: true, new: true }
        );
        res.json({ message: 'Salary structure updated.', salary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update salary structure.' });
    }
});

// --- END OF LEGACY ---

// POST /api/payroll/payout-upload — Admin Only (Bulk Excel)
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `payout-${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx') cb(null, true);
        else cb(new Error('Only .xlsx files allowed'));
    }
});

router.post('/payout-upload', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload an Excel file' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            skippedFhrids: [],
            missingDataRows: 0
        };

        const payoutsToInsert = [];
        if (data.length > 0) {
            console.log('Detected Excel Headers:', Object.keys(data[0]));
        }

        const getVal = (row, candidates) => {
            const keys = Object.keys(row);
            for (const cand of candidates) {
                const key = keys.find(k => k.toLowerCase() === cand.toLowerCase());
                if (key) return row[key];
            }
            return undefined;
        };

        // Since month/year are likely missing from this specific Excel sheet format, 
        // we will use the ones passed from the frontend selection to ensure data is filed correctly.
        const queryMonth = Number(req.query.month) || new Date().getMonth() + 1;
        const queryYear = Number(req.query.year) || new Date().getFullYear();

        for (const [index, row] of data.entries()) {
            const fhrid = getVal(row, ['FHR_ID', 'FHRID'])?.toString().trim();
            const fullName = getVal(row, ['WM Name', 'Full Name', 'Name', 'WM_Name'])?.toString().trim();
            const hubName = getVal(row, ['Hub Name', 'HubName', 'Hub'])?.toString().trim();

            if (!fhrid) {
                console.warn(`Payout Upload Row ${index + 1} skipped: Missing FHRID.`);
                results.failed++;
                continue;
            }

            const userExists = await User.findOne({
                fhrId: { $regex: new RegExp(`^${fhrid}$`, 'i') }
            });

            if (!userExists) {
                results.failed++;
                results.skippedFhrids.push(fhrid);
                continue;
            }

            payoutsToInsert.push({
                fhrid,
                month: queryMonth,
                year: queryYear,

                // Core
                profileId: getVal(row, ['Profile ID', 'Profile_ID']),
                full_name: fullName || userExists.fullName,
                hub_name: hubName,
                accountNumber: getVal(row, ['Ac Number', 'Account Number', 'A/c No', 'Ac_Number']),
                ifscCode: getVal(row, ['IFSC Coad', 'IFSC Code', 'IFSC', 'IFSC_Coad']),

                // Operations
                workingDays: Number(getVal(row, ['Working Days', 'Working_Days'])) || 0,
                totalAssigned: Number(getVal(row, ['Total Assigned', 'Total_Assigned'])) || 0,
                totalNormalDelivery: Number(getVal(row, ['Total Normal Delivery', 'Total_Normal_Delivery'])) || 0,
                sopsyDelivered: Number(getVal(row, ['SOPSY Delivered', 'SOPSY_Delivered'])) || 0,
                gtnlDelivered: Number(getVal(row, ['GTNL Delivered', 'GTNL_Delivered'])) || 0,
                u2sShipment: Number(getVal(row, ['U2S Shipment', 'U2S_Shipment'])) || 0,
                totalDeliveryCount: Number(getVal(row, ['Total Delivery Count', 'Total_Delivery_Count'])) || 0,
                conversion: getVal(row, ['Conversion']),

                // Rates
                lmaBaseRate: Number(getVal(row, ['LMA Base Rate', 'LMA_Base_Rate'])) || 0,
                lmaBasePayAmt: Number(getVal(row, ['LMA Base Pay Amt.', 'LMA_Base_Pay_Amt'])) || 0,
                lmaPayAmt10P: Number(getVal(row, ['LMA Pay Amt 10/P', 'LMA_Pay_Amt_10_P'])) || 0,
                sopsyBasePayAmt18P: Number(getVal(row, ['SOPSY Base Pay Amt. 18/P', 'SOPSY_Base_Pay_Amt_18_P'])) || 0,
                gtnlBasePayAmt6P: Number(getVal(row, ['GTNL Base Pay Amt. 6/P', 'GTNL_Base_Pay_Amt_6_P'])) || 0,
                u25BaseAmt: Number(getVal(row, ['U25 Base Amt.', 'U25_Base_Amt'])) || 0,

                // Financials
                finalBasePayAmt: Number(getVal(row, ['Final Base Pay Amt.', 'Final_Base_Pay_Amt'])) || 0,
                tds: Number(getVal(row, ['Tds 1%', 'TDS', 'Tds_1_Percent'])) || 0,
                finalBaseAmount: Number(getVal(row, ['Final Base Amount', 'Final_Base_Amount'])) || 0,
                advance: Number(getVal(row, ['Adavance', 'Advance', 'Advance_Amount'])) || 0,
                totalPayAmount: Number(getVal(row, ['Total Pay Amount', 'Net_Pay', 'Total_Pay_Amount'])) || 0,
                remark: getVal(row, ['Remark', 'Remarks'])?.toString().trim()
            });
            results.success++;
        }

        if (payoutsToInsert.length > 0) {
            try {
                // ordered: false allows continuing on duplicate key errors
                await PayoutReport.insertMany(payoutsToInsert, { ordered: false });

                // Notify all successful users
                const { sendNotification } = require('../services/notificationService');
                for (const payout of payoutsToInsert) {
                    const targetUser = await User.findOne({ fhrId: payout.fhrid });
                    if (targetUser) {
                        await sendNotification(
                            targetUser._id,
                            'Payout Ledger Updated',
                            `Your payout record for ${queryMonth}/${queryYear} has been updated.`
                        );
                    }
                }
            } catch (err) {
                console.warn('Partial error in payout insertMany (duplicates):', err.message);
            }
        }

        res.json({
            message: `Processed ${data.length} rows.`,
            summary: results
        });

    } catch (error) {
        console.error('Payout Upload Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /api/payroll/salary-slip-upload — Admin Only (Auto PDF Generation)
router.post('/salary-slip-upload', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload an Excel file' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const queryMonth = Number(req.query.month) || new Date().getMonth() + 1;
        const queryYear = Number(req.query.year) || new Date().getFullYear();

        const results = { total: data.length, success: 0, failed: 0, registered: 0, skippedFhrids: [] };

        const getVal = (row, candidates) => {
            const keys = Object.keys(row);
            for (const cand of candidates) {
                // Try exact match, then normalized match (lowercase, no spaces/underscores)
                const normalizedCand = cand.toLowerCase().replace(/[\s_()\-]/g, '');
                const key = keys.find(k => k.toLowerCase().replace(/[\s_()\-]/g, '') === normalizedCand);
                if (key) return row[key];
            }
            return undefined;
        };

        for (const [index, row] of data.entries()) {
            const fhrid = getVal(row, ['fhrid', 'FHR_ID', 'FHRID'])?.toString().trim();
            const employeeName = getVal(row, ['employeeName', 'WM_Name', 'Name', 'WM Name', 'Employee Name', 'Full Name']);

            if (!fhrid) {
                console.warn(`Row ${index + 1} skipped: Missing FHRID column or value.`);
                results.failed++;
                results.skippedFhrids.push(`Row ${index + 1}: Missing FHRID`);
                continue;
            }

            let user = await User.findOne({ fhrId: { $regex: new RegExp(`^${fhrid}$`, 'i') } });

            // If user doesn't exist, register them (Case: User not in DB but in Excel)
            if (!user) {
                try {
                    console.log(`Auto-registering user from Excel: ${employeeName} (${fhrid})`);
                    user = await User.create({
                        fullName: employeeName || 'New Employee',
                        fhrId: fhrid,
                        employeeId: fhrid,
                        mobile: getVal(row, ['mobile', 'Phone', 'Contact']) || `MISSING-${fhrid}`, // Use FHRID to ensure uniqueness
                        password: 'Password@123', // Default password
                        role: 'employee',
                        status: 'Active',
                        isApproved: true,
                        isAccountActivated: true,
                        isSelfRegistered: false,
                        designation: getVal(row, ['designation', 'Designation']),
                        accountNumber: getVal(row, ['accountNumber', 'Account_Number', 'A/c No', 'Account Number']),
                        ifscCode: getVal(row, ['ifscCode', 'IFSC', 'IFSC_Code', 'IFSC Code']),
                    });
                    results.registered++;
                } catch (regErr) {
                    console.error(`Failed to register user ${fhrid}:`, regErr.message);
                    results.failed++;
                    results.skippedFhrids.push(`${fhrid}: Registration Failed (${regErr.message})`);
                    continue;
                }
            }

            // Map data exactly as provided in Excel or fallback to User DB
            const payslipData = {
                fhrid,
                month: queryMonth,
                year: queryYear,
                employeeName: employeeName || user.fullName,
                designation: getVal(row, ['designation', 'Designation']) || user.designation || 'Delivery Executive',
                doj: getVal(row, ['dateOfJoin', 'DOJ', 'Date_of_Joining', 'Date of Joining']),
                payDate: getVal(row, ['payDate', 'Date', 'Pay Date', 'payDate (YYYY-MM-DD)']),
                accountNumber: getVal(row, ['accountNumber', 'Account_Number', 'A/c No', 'Account Number']) || user.accountNumber,
                ifscCode: getVal(row, ['ifscCode', 'IFSC', 'IFSC_Code', 'IFSC Code']) || user.ifscCode,

                paidDays: Number(getVal(row, ['paidDays', 'Paid_Days', 'Paid Days', 'Days'])) || 0,
                lopDays: Number(getVal(row, ['lopDays', 'LOP_Days', 'LOP Days', 'LOP'])) || 0,

                basic: Number(getVal(row, ['basic', 'Final_Base_Pay_Amt.', 'Base_Salary'])) || 0,
                conveyance: Number(getVal(row, ['conveyance', 'Conveyance'])) || 0,
                incentives: Number(getVal(row, ['incentives', 'Incentives'])) || 0,
                otherAllowances: Number(getVal(row, ['otherAllowances', 'Other_Allowances'])) || 0,

                tds: Number(getVal(row, ['tds', 'TDS', 'Tds_1%'])) || 0,
                advance: Number(getVal(row, ['advance', 'Adavance', 'Advance_Amount'])) || 0,
                otherDeductions: Number(getVal(row, ['otherDeductions', 'Other_Deductions'])) || 0,

                netPayable: Number(getVal(row, ['netPayable', 'Total_Pay_Amount', 'Net_Pay'])) || 0
            };

            // Calculate derived fields exactly from input
            payslipData.grossEarnings = Number(getVal(row, ['grossEarnings', 'Gross_Earnings', 'Gross', 'Gross Earnings'])) || (payslipData.basic + payslipData.conveyance + payslipData.incentives + payslipData.otherAllowances);
            payslipData.totalDeductions = Number(getVal(row, ['totalDeductions', 'Total_Deductions', 'Deductions', 'Total Deductions'])) || (payslipData.tds + payslipData.advance + payslipData.otherDeductions);

            try {
                // Generate PDF
                const pdfPath = await pdfService.generateSalarySlip(payslipData);
                payslipData.pdfPath = pdfPath;

                // Upsert Payslip record
                await Payslip.findOneAndUpdate(
                    { fhrid, month: queryMonth, year: queryYear },
                    payslipData,
                    { upsert: true, new: true }
                );

                // Create Notification for Employee (Real-time)
                const { sendNotification } = require('../services/notificationService');
                await sendNotification(
                    user._id,
                    'Salary Slip Generated',
                    `Your salary slip for ${payslipData.month}/${payslipData.year} is now available for download.`
                );

                results.success++;
            } catch (err) {
                console.error(`Error generating slip for ${fhrid}:`, err);
                results.failed++;
                results.skippedFhrids.push(`${fhrid}: ${err.code === 11000 ? 'Duplicate Entry' : 'Generation Error'}`);
            }
        }

        res.json({
            message: 'Processed',
            total_rows: results.total,
            success_count: results.success,
            registered_count: results.registered,
            failed_count: results.failed,
            skipped_fhrids: results.skippedFhrids
        });

    } catch (error) {
        console.error('Salary Slip Upload Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/salary-slips/employee — Employee View (FHRID Isolation)
router.get('/salary-slips/employee', authenticate, authorizeEmployee, async (req, res) => {
    try {
        if (!req.user.fhrId) return res.json({ slips: [] });
        const slips = await Payslip.find({ fhrid: req.user.fhrId }).sort({ year: -1, month: -1 });
        res.json({ slips });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/salary-slips — Admin View
router.get('/salary-slips', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const slips = await Payslip.find(filter).sort({ year: -1, month: -1 });
        res.json({ slips });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/payout/employee — Employee View Own (STRICT FHRID ISOLATION)

router.get('/payout/employee', authenticate, authorizeEmployee, async (req, res) => {
    try {
        if (!req.user.fhrId) {
            return res.json({ payouts: [], message: 'FHRID not assigned.' });
        }

        const payouts = await PayoutReport.find({ fhrid: req.user.fhrId })
            .sort({ year: -1, month: -1 });

        res.json({ payouts });
    } catch (error) {
        console.error('Employee payout fetch error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/payout — Admin View
router.get('/payout', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const payouts = await PayoutReport.find(filter).sort({ year: -1, month: -1 });
        res.json({ payouts });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/salary-slips/:id/pdf — Download PDF (Secure)
router.get('/salary-slips/:id/pdf', authenticate, async (req, res) => {
    try {
        const slip = await Payslip.findById(req.params.id);
        if (!slip) return res.status(404).json({ error: 'Not found' });

        // Security: If not admin, must be the owner
        if (req.user.role !== 'admin' && slip.fhrid !== req.user.fhrId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!slip.pdfPath) return res.status(404).json({ error: 'PDF not generated' });

        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(__dirname, '..', slip.pdfPath);
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File missing' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=salary_slip_${slip.fhrid}_${slip.month}_${slip.year}.pdf`);
        fs.createReadStream(fullPath).pipe(res);
    } catch (error) {
        console.error('Payslip download error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/payroll/payout/:id/pdf — Download Payout PDF (Secure + Isolated)
router.get('/payout/:id/pdf', authenticate, async (req, res) => {
    try {
        const payout = await PayoutReport.findById(req.params.id);
        if (!payout) return res.status(404).json({ error: 'Not found' });

        // Security: If not admin, must be the owner
        if (req.user.role !== 'admin' && req.user.role !== 'hr') {
            if (!req.user.fhrId || payout.fhrid.toLowerCase() !== req.user.fhrId.toLowerCase()) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
        }

        const PDFDocument = require('pdfkit');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formatCurr = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payout_${payout.fhrid}_${payout.month}_${payout.year}.pdf`);
        doc.pipe(res);

        // ─── HEADER WITH LOGO ───────────────────────────────────────────────
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 40, { width: 140 });
        }

        // Company Details (Right side - matches salary slip style)
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a365d')
            .text('ANGLE COURIER AND LOGISTICS', 190, 45, { align: 'center', width: 365 });

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
            .text('ARAZI NO-372, PATANAVA BASANT NAGAR VNS', 190, 72, { align: 'center', width: 365 });
        doc.text('VARANASI-221110 UTTAR PRADESH', 190, 86, { align: 'center', width: 365 });
        doc.text('TEL. NO.:9889122531', 190, 100, { align: 'center', width: 365 });

        // Thin line separator
        doc.moveTo(40, 125).lineTo(555, 125).strokeColor('#000000').lineWidth(0.5).stroke();

        // Title ribbon
        doc.rect(40, 108, 515, 28).fill('#1e293b');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
            .text(`Monthly Payout Statement — ${monthNames[(payout.month || 1) - 1]}, ${payout.year}`, 40, 116, { align: 'center' });

        // ─── EMPLOYEE BOX ─────────────────────────────────────────────────────
        const boxTop = 148;
        doc.rect(40, boxTop, 250, 80).stroke('#e2e8f0');
        doc.rect(305, boxTop, 250, 80).stroke('#e2e8f0');

        const infoLabel = (text, x, y) => doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text(text, x, y);
        const infoValue = (text, x, y) => doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(text || 'N/A', x, y);

        infoLabel('Employee Name', 50, boxTop + 10); infoValue(payout.full_name, 50, boxTop + 22);
        infoLabel('FHR ID', 50, boxTop + 45); infoValue(payout.fhrid, 50, boxTop + 57);
        infoLabel('Hub', 180, boxTop + 10); infoValue(payout.hub_name, 180, boxTop + 22);

        infoLabel('Pay Period', 315, boxTop + 10); infoValue(`${monthNames[(payout.month || 1) - 1]} ${payout.year}`, 315, boxTop + 22);
        infoLabel('Account No.', 315, boxTop + 45); infoValue(payout.accountNumber, 315, boxTop + 57);
        infoLabel('IFSC', 430, boxTop + 45); infoValue(payout.ifscCode, 430, boxTop + 57);

        // ─── OPERATIONS TABLE ─────────────────────────────────────────────────
        let y = boxTop + 100;
        doc.rect(40, y, 515, 22).fill('#f8fafc').stroke('#e2e8f0');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('OPERATIONS SUMMARY', 50, y + 7);
        y += 22;

        const tableRow = (label, value, bg = '#ffffff', bold = false) => {
            doc.rect(40, y, 515, 20).fill(bg).stroke('#e2e8f0');
            doc.fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#334155').text(label, 55, y + 6);
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(bold ? '#0f172a' : '#475569').text(String(value || 0), 450, y + 6, { align: 'right', width: 90 });
            y += 20;
        };

        tableRow('Working Days', payout.workingDays);
        tableRow('Total Assigned Shipments', payout.totalAssigned, '#f8fafc');
        tableRow('Total Normal Deliveries', payout.totalNormalDelivery);
        tableRow('SOPSY Delivered', payout.sopsyDelivered, '#f8fafc');
        tableRow('GTNL Delivered', payout.gtnlDelivered);
        tableRow('U2S Shipments', payout.u2sShipment, '#f8fafc');
        tableRow('Total Delivery Count', payout.totalDeliveryCount, '#ffffff', true);
        tableRow('Conversion Rate', payout.conversion || 'N/A', '#f8fafc');

        // ─── FINANCIALS ───────────────────────────────────────────────────────
        y += 12;
        doc.rect(40, y, 515, 22).fill('#1e293b').stroke('#1e293b');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff').text('FINANCIAL BREAKDOWN', 50, y + 7);
        doc.fillColor('#94a3b8').text('AMOUNT', 50, y + 7, { align: 'right', width: 495 });
        y += 22;

        const finRow = (label, value, color = '#334155', bg = '#ffffff') => {
            doc.rect(40, y, 515, 22).fill(bg).stroke('#e2e8f0');
            doc.fontSize(9).font('Helvetica').fillColor('#475569').text(label, 55, y + 7);
            doc.font('Helvetica-Bold').fillColor(color).text(formatCurr(value), 50, y + 7, { align: 'right', width: 495 });
            y += 22;
        };

        finRow('LMA Base Pay Amount', payout.lmaBasePayAmt, '#334155', '#f8fafc');
        finRow('SOPSY Base Pay (18/P)', payout.sopsyBasePayAmt18P);
        finRow('GTNL Base Pay (6/P)', payout.gtnlBasePayAmt6P, '#334155', '#f8fafc');
        finRow('Final Base Pay Amount', payout.finalBasePayAmt, '#0f172a', '#ffffff');
        finRow('TDS (1%)', payout.tds, '#dc2626', '#fff5f5');
        finRow('Advance Adjustment', payout.advance, '#dc2626', '#fff5f5');

        // Net Pay highlight row
        y += 5;
        doc.rect(40, y, 515, 36).fill('#C46A2D');
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff').text('TOTAL NET PAY', 55, y + 12);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#ffffff')
            .text(formatCurr(payout.totalPayAmount), 55, y + 10, { align: 'right', width: 490 });
        y += 36;

        // Remark
        if (payout.remark) {
            y += 10;
            doc.rect(40, y, 515, 30).fill('#fefce8').stroke('#fde68a');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#92400e').text('NOTE:', 55, y + 10);
            doc.font('Helvetica').fillColor('#78350f').text(payout.remark, 90, y + 10, { width: 470 });
        }

        // Footer
        doc.rect(40, 780, 515, 1).fill('#e2e8f0');
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
            .text('This is a system-generated document. No signature required.', 40, 790, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Payout PDF error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

module.exports = router;

