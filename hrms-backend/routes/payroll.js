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

        const results = { total: data.length, success: 0, failed: 0, skippedFhrids: [] };

        const getVal = (row, candidates) => {
            const keys = Object.keys(row);
            for (const cand of candidates) {
                const key = keys.find(k => k.toLowerCase().replace(/\s/g, '_') === cand.toLowerCase().replace(/\s/g, '_'));
                if (key) return row[key];
            }
            return undefined;
        };

        for (const [index, row] of data.entries()) {
            const fhrid = getVal(row, ['FHR_ID', 'FHRID'])?.toString().trim();
            if (!fhrid) {
                console.warn(`Row ${index + 1} skipped: Missing FHRID column or value.`);
                results.failed++;
                results.skipped_fhrids.push(`Row ${index + 1}: Missing FHRID`);
                continue;
            }

            const user = await User.findOne({ fhrId: { $regex: new RegExp(`^${fhrid}$`, 'i') } });
            if (!user) {
                console.warn(`Row ${index + 1} skipped: FHRID ${fhrid} not found in database.`);
                results.failed++;
                results.skipped_fhrids.push(`${fhrid} (Not Found)`);
                continue;
            }

            // Map data exactly as provided in Excel
            const payslipData = {
                fhrid,
                month: queryMonth,
                year: queryYear,
                employeeName: getVal(row, ['Employee_Name', 'WM_Name', 'Name', 'WM Name', 'Employee Name']) || user.fullName,
                designation: getVal(row, ['Designation']) || 'Delivery Executive',
                doj: getVal(row, ['DOJ', 'Date_of_Joining', 'Date of Joining']),
                payDate: getVal(row, ['Pay_Date', 'Date', 'Pay Date']),
                accountNumber: getVal(row, ['Ac_Number', 'Account_Number', 'A/c No', 'Account Number']),
                ifscCode: getVal(row, ['IFSC_Coad', 'IFSC', 'IFSC_Code', 'IFSC Code']),

                paidDays: getVal(row, ['Paid_Days', 'Paid Days', 'Days']),
                lopDays: getVal(row, ['LOP_Days', 'LOP Days', 'LOP']),

                basic: Number(getVal(row, ['Basic', 'Final_Base_Pay_Amt.', 'Base_Salary'])) || 0,
                conveyance: Number(getVal(row, ['Conveyance'])) || 0,
                incentives: Number(getVal(row, ['Incentives'])) || 0,
                otherAllowances: Number(getVal(row, ['Other_Allowances'])) || 0,

                tds: Number(getVal(row, ['TDS', 'Tds_1%'])) || 0,
                advance: Number(getVal(row, ['Advance', 'Adavance', 'Advance_Amount'])) || 0,
                otherDeductions: Number(getVal(row, ['Other_Deductions'])) || 0,

                netPayable: Number(getVal(row, ['Net_Payable', 'Total_Pay_Amount', 'Net_Pay'])) || 0
            };

            // Calculate derived fields exactly from input
            payslipData.grossEarnings = Number(getVal(row, ['Gross_Earnings', 'Gross', 'Gross Earnings'])) || (payslipData.basic + payslipData.conveyance + payslipData.incentives + payslipData.otherAllowances);
            payslipData.totalDeductions = Number(getVal(row, ['Total_Deductions', 'Deductions', 'Total Deductions'])) || (payslipData.tds + payslipData.advance + payslipData.otherDeductions);

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

                results.success++;
            } catch (err) {
                console.error(`Error generating slip for ${fhrid}:`, err);
                results.failed++;
                results.skipped_fhrids.push(`${fhrid}: ${err.code === 11000 ? 'Duplicate Entry' : 'Generation Error'}`);
            }
        }

        res.json({
            message: 'Processed',
            total_rows: results.total,
            success_count: results.success,
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

module.exports = router;
