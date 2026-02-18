const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Payslip = require('../models/Payslip');
const PayoutReport = require('../models/PayoutReport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SalaryStructure = require('../models/SalaryStructure');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { calculateMonthlyPayout } = require('../services/payrollEngine');

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

// POST /api/payroll/generate/:userId — Generate individual payslip
router.post('/generate/:userId', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required.' });

        const calc = await calculateMonthlyPayout(req.params.userId, parseInt(month), parseInt(year));

        const payslip = await Payslip.findOneAndUpdate(
            { userId: req.params.userId, month: parseInt(month), year: parseInt(year) },
            {
                ...calc,
                userId: req.params.userId,
                month: parseInt(month),
                year: parseInt(year),
            },
            { upsert: true, new: true }
        );

        // Notify employee
        const { sendNotification } = require('../services/notificationService');
        await sendNotification(
            req.params.userId,
            'Payslip Generated',
            `Your payslip for ${month}/${year} is ready. Net Payable: ₹${calc.netPayable}`
        );

        res.json({ message: 'Payslip generated.', payslip });
    } catch (error) {
        console.error('Generate payslip error:', error);
        res.status(500).json({ error: 'Failed to generate payslip.' });
    }
});

// POST /api/payroll/generate-bulk — Generate monthly bulk payout for all employees
router.post('/generate-bulk', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required.' });

        const employees = await User.find({ role: 'employee', status: 'Active' });
        const results = [];
        const errors = [];

        for (const emp of employees) {
            try {
                const calc = await calculateMonthlyPayout(emp._id, parseInt(month), parseInt(year));

                // Upsert payout report
                await PayoutReport.findOneAndUpdate(
                    { userId: emp._id, month: parseInt(month), year: parseInt(year) },
                    calc,
                    { upsert: true, new: true }
                );

                // Upsert payslip
                await Payslip.findOneAndUpdate(
                    { userId: emp._id, month: parseInt(month), year: parseInt(year) },
                    { ...calc, userId: emp._id, month: parseInt(month), year: parseInt(year) },
                    { upsert: true, new: true }
                );

                // Notify employee
                const { sendNotification } = require('../services/notificationService');
                await sendNotification(
                    emp._id,
                    'Salary Published',
                    `Your payout for ${month}/${year} has been processed. Total: ₹${calc.totalPayAmount}`
                );

                results.push({ employeeId: emp.employeeId, name: emp.fullName, totalPay: calc.totalPayAmount });
            } catch (err) {
                errors.push({ employeeId: emp.employeeId, error: err.message });
            }
        }

        res.json({
            message: `Bulk payout generated for ${results.length} employees.`,
            processed: results.length,
            errors: errors.length,
            results,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('Bulk payroll error:', error);
        res.status(500).json({ error: 'Failed to generate bulk payroll.' });
    }
});

// GET /api/payroll/payslips — Admin gets all; Employee gets own
router.get('/payslips', authenticate, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        }
        if (req.query.month) filter.month = parseInt(req.query.month);
        if (req.query.year) filter.year = parseInt(req.query.year);
        if (req.query.userId && req.user.role === 'admin') filter.userId = req.query.userId;

        const payslips = await Payslip.find(filter)
            .populate('userId', 'fullName employeeId designation department')
            .sort({ year: -1, month: -1 });

        res.json({ payslips });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payslips.' });
    }
});

// GET /api/payroll/payslips/:id/pdf — Download payslip as PDF
router.get('/payslips/:id/pdf', authenticate, async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id).populate('userId', 'fullName employeeId designation department hubName');
        if (!payslip) return res.status(404).json({ error: 'Payslip not found.' });

        // Check ownership for employees
        if (req.user.role === 'employee' && payslip.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`);
        doc.pipe(res);

        // Company Header
        doc.fontSize(20).font('Helvetica-Bold').text('ANGLE COURIER', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text('Employee Pay Summary', { align: 'center' });
        doc.moveDown();

        // Divider
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // Employee Info
        doc.fontSize(10).font('Helvetica-Bold').text('Employee Details');
        doc.fontSize(9).font('Helvetica');
        doc.text(`Name: ${payslip.employeeName || payslip.userId?.fullName || 'N/A'}`);
        doc.text(`Employee ID: ${payslip.employeeId || payslip.userId?.employeeId || 'N/A'}`);
        doc.text(`Designation: ${payslip.designation || payslip.userId?.designation || 'N/A'}`);
        doc.text(`Department: ${payslip.department || payslip.userId?.department || 'N/A'}`);
        doc.text(`Pay Period: ${payslip.month}/${payslip.year}`);
        doc.text(`Paid Days: ${payslip.paidDays}  |  LOP Days: ${payslip.lopDays}`);
        doc.moveDown();

        // Divider
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // Earnings
        const earningsTop = doc.y;
        doc.fontSize(11).font('Helvetica-Bold').text('EARNINGS', 50, earningsTop);
        doc.fontSize(9).font('Helvetica');
        doc.text(`Basic (${payslip.paidDays} days × ₹${payslip.baseRate})`, 50, doc.y + 5);
        doc.text(`₹${payslip.basic?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        if (payslip.incentives > 0) {
            doc.text(`Incentives (${payslip.deliveredCount} del.)`, 50, doc.y + 3);
            doc.text(`₹${payslip.incentives?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        }
        doc.text('Conveyance', 50, doc.y + 3);
        doc.text(`₹${payslip.conveyance?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Gross Earnings', 50);
        doc.text(`₹${payslip.grossEarnings?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        doc.moveDown();

        // Deductions
        doc.fontSize(11).text('DEDUCTIONS', 50);
        doc.fontSize(9).font('Helvetica');
        doc.text('TDS (1%)', 50, doc.y + 5);
        doc.text(`₹${payslip.tds?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        doc.text('Advance', 50, doc.y + 3);
        doc.text(`₹${payslip.advance?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Total Deductions', 50);
        doc.text(`₹${payslip.totalDeductions?.toFixed(2) || '0.00'}`, 300, doc.y - 11, { align: 'right', width: 195 });
        doc.moveDown(2);

        // Net Payable
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(14).font('Helvetica-Bold').text('NET PAYABLE', 50);
        doc.text(`₹${payslip.netPayable?.toFixed(2) || '0.00'}`, 300, doc.y - 17, { align: 'right', width: 195 });
        doc.moveDown(2);

        // Footer
        doc.fontSize(8).font('Helvetica').fillColor('#888888')
            .text('This is a computer-generated payslip and does not require a signature.', { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF.' });
    }
});

// GET /api/payroll/payout — Get monthly payout report
router.get('/payout', authenticate, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        }
        if (req.query.month) filter.month = parseInt(req.query.month);
        if (req.query.year) filter.year = parseInt(req.query.year);

        const payouts = await PayoutReport.find(filter)
            .populate('userId', 'fullName employeeId hubName')
            .sort({ createdAt: -1 });

        res.json({ payouts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payouts.' });
    }
});

// GET /api/payroll/payout/pdf — Export as PDF
router.get('/payout/pdf', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const payouts = await PayoutReport.find(filter).populate('userId', 'fullName employeeId hubName');

        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payout_report_${month}_${year}.pdf`);
        doc.pipe(res);

        doc.fontSize(16).font('Helvetica-Bold').text(`Monthly Payout Report - ${month}/${year}`, { align: 'center' });
        doc.moveDown();

        const tableTop = 80;
        const colWidths = [120, 60, 50, 60, 60, 60, 60, 50, 60, 70];
        const headers = ['Employee', 'ID', 'Days', 'Delivered', 'Picked', 'Basic', 'Incentives', 'TDS', 'Adv.', 'Net'];

        let currentY = tableTop;

        // Draw Headers
        doc.fontSize(8).font('Helvetica-Bold');
        let x = 30;
        headers.forEach((h, i) => {
            doc.text(h, x, currentY);
            x += colWidths[i];
        });

        currentY += 15;
        doc.moveTo(30, currentY).lineTo(780, currentY).stroke();
        currentY += 5;

        // Draw Rows
        doc.font('Helvetica').fontSize(7);
        payouts.forEach(p => {
            if (currentY > 500) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
                currentY = 40;
            }
            let rowX = 30;
            doc.text(p.userId?.fullName || 'N/A', rowX, currentY, { width: 115, truncate: true }); rowX += colWidths[0];
            doc.text(p.userId?.employeeId || 'N/A', rowX, currentY); rowX += colWidths[1];
            doc.text(p.workingDays?.toString() || '0', rowX, currentY); rowX += colWidths[2];
            doc.text(p.deliveredCount?.toString() || '0', rowX, currentY); rowX += colWidths[3];
            doc.text(p.pickedCount?.toString() || '0', rowX, currentY); rowX += colWidths[4];
            doc.text(p.basic?.toFixed(0) || '0', rowX, currentY); rowX += colWidths[5];
            doc.text(p.incentives?.toFixed(0) || '0', rowX, currentY); rowX += colWidths[6];
            doc.text(p.tds?.toFixed(0) || '0', rowX, currentY); rowX += colWidths[7];
            doc.text(p.advance?.toFixed(0) || '0', rowX, currentY); rowX += colWidths[8];
            doc.font('Helvetica-Bold').text(p.totalPayAmount?.toFixed(0) || '0', rowX, currentY);
            doc.font('Helvetica');

            currentY += 15;
        });

        doc.end();
    } catch (error) {
        console.error('Payout PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF.' });
    }
});

// GET /api/payroll/payout/excel — Export as Excel
router.get('/payout/excel', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const payouts = await PayoutReport.find(filter).populate('userId', 'fullName employeeId');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Monthly Payout Report');

        // Header row
        sheet.columns = [
            { header: 'Profile ID', key: 'profileId', width: 12 },
            { header: 'Employee Name', key: 'wmName', width: 25 },
            { header: 'Hub Name', key: 'hubName', width: 15 },
            { header: 'Working Days', key: 'workingDays', width: 14 },
            { header: 'Delivered', key: 'deliveredCount', width: 12 },
            { header: 'Picked', key: 'pickedCount', width: 12 },
            { header: 'Base Rate', key: 'baseRate', width: 12 },
            { header: 'Basic Pay', key: 'basic', width: 14 },
            { header: 'Incentives', key: 'incentives', width: 14 },
            { header: 'Final Base', key: 'finalBaseAmount', width: 14 },
            { header: 'TDS 1%', key: 'tds', width: 10 },
            { header: 'Advance', key: 'advance', width: 12 },
            { header: 'Total Pay', key: 'totalPayAmount', width: 18 },
            { header: 'Remark', key: 'remark', width: 20 },
        ];

        // Style header
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        payouts.forEach(p => {
            sheet.addRow({
                profileId: p.profileId,
                wmName: p.wmName,
                hubName: p.hubName,
                workingDays: p.workingDays,
                deliveredCount: p.deliveredCount,
                pickedCount: p.pickedCount,
                baseRate: p.baseRate,
                basic: p.basic,
                incentives: p.incentives,
                finalBaseAmount: p.finalBaseAmount,
                tds: p.tds,
                advance: p.advance,
                totalPayAmount: p.totalPayAmount,
                remark: p.remark || '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=payout_report_${month}_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({ error: 'Failed to export Excel.' });
    }
});

module.exports = router;
