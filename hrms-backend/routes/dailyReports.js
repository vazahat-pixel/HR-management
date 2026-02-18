const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const DailyReport = require('../models/DailyReport');
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `report-${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx' || ext === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only (.xlsx, .csv) files allowed'));
        }
    }
});

// POST /api/hr/daily-report/upload - HR Only
router.post('/upload', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload an Excel/CSV file' });
        const { reportDate } = req.body;
        if (!reportDate) return res.status(400).json({ error: 'Report date is required' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Helper for case-insensitive key lookup (Robustness Fix)
        const getRowValue = (row, candidates) => {
            const keys = Object.keys(row);
            for (const candidate of candidates) {
                const foundKey = keys.find(k => k.toLowerCase() === candidate.toLowerCase());
                if (foundKey) return row[foundKey];
            }
            return undefined;
        };

        const results = {
            success: 0,
            failed: 0,
            details: []
        };

        const reportsToInsert = [];
        const dateObj = new Date(reportDate);
        dateObj.setHours(0, 0, 0, 0);

        if (data.length > 0) {
            console.log('Upload Headers Found:', Object.keys(data[0]));
        }

        for (const row of data) {
            // Robust Field Mapping
            const ehrId = getRowValue(row, ['CasperEHRID', 'EHR-ID', 'EHRID', 'Casper ID', 'Casper'])?.toString().trim();
            const fullName = getRowValue(row, ['Full_Name', 'FullName', 'Name', 'Employee Name', 'Employee'])?.toString().trim();
            const mobile = getRowValue(row, ['Mobile', 'Mobile No', 'Phone', 'Contact'])?.toString().trim();
            const empCode = getRowValue(row, ['EmployeeID', 'EmpID', 'EmpCode', 'ID'])?.toString().trim();

            const hubName = getRowValue(row, ['HubName', 'Hub'])?.toString().trim();
            const ofd = Number(getRowValue(row, ['OFD', 'OutForDelivery'])) || 0;
            const ofp = Number(getRowValue(row, ['OFP', 'OutForPickup'])) || 0;
            const del = Number(getRowValue(row, ['DEL', 'Delivered'])) || 0;
            const pick = Number(getRowValue(row, ['PICK', 'Picked'])) || 0;

            if (!ehrId && !fullName && !mobile && !empCode) {
                continue;
            }

            // Find employee by various means
            let employee;
            if (ehrId) employee = await User.findOne({ ehrId });

            if (!employee && mobile) {
                employee = await User.findOne({ mobile });
            }

            if (!employee && empCode) {
                employee = await User.findOne({ employeeId: empCode });
            }

            if (!employee && fullName) {
                // FALLBACK: Try exact name match (Case Insensitive)
                employee = await User.findOne({ fullName: { $regex: new RegExp(`^${fullName}$`, 'i') } });
            }

            if (!employee) {
                results.failed++;
                results.details.push({ ehrId, name: fullName, mobile, reason: 'Employee not found (checked ID, Mobile, Name)' });
                continue;
            }

            // AUTO-LINK: If user found but missing ehrId, save it for future
            if (!employee.ehrId && ehrId) {
                employee.ehrId = ehrId;
                await employee.save();
                console.log(`Auto-linked CasperID ${ehrId} to ${employee.fullName}`);
            }

            // Check for duplicate for this date and employee
            const existing = await DailyReport.findOne({ employeeId: employee._id, reportDate: dateObj });
            if (existing) {
                results.failed++;
                results.details.push({ ehrId, name: employee.fullName, reason: `Report already exists for date ${reportDate}` });
                continue;
            }

            reportsToInsert.push({
                employeeId: employee._id,
                ehrId: ehrId || employee.ehrId || 'MANUAL-UPLOAD',
                hubName: hubName || employee.hubName,
                ofd, ofp,
                delivered: del,
                picked: pick,
                reportDate: dateObj,
                uploadedBy: req.user._id
            });
            results.success++;
        }

        if (reportsToInsert.length > 0) {
            await DailyReport.insertMany(reportsToInsert);

            // Create Notifications for employees (Bulk)
            const Notification = require('../models/Notification');
            const notifications = reportsToInsert.map(report => ({
                userId: report.employeeId,
                title: 'Daily Performance Update',
                message: `Your report for ${new Date(report.reportDate).toLocaleDateString()} is available.`,
                isRead: false
            }));

            try {
                await Notification.insertMany(notifications);
            } catch (notifErr) {
                console.error('Failed to create notifications for daily reports:', notifErr);
            }
        }

        res.json({
            message: `Processed ${data.length} rows. ${results.success} succeeded, ${results.failed} failed.`,
            results
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process report: ' + error.message });
    }
});

// GET /api/employee/daily-report - Employee View Own (STRICT ISOLATION)
const { authorizeEmployee } = require('../middleware/auth');

router.get('/employee', authenticate, authorizeEmployee, async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        // STRICT FILTERING: employeeId MUST be req.user._id
        const query = { employeeId: req.user._id };

        if (startDate || endDate) {
            query.reportDate = {};
            if (startDate) query.reportDate.$gte = new Date(startDate);
            if (endDate) query.reportDate.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const reports = await DailyReport.find(query)
            .sort({ reportDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await DailyReport.countDocuments(query);

        res.json({
            reports,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Employee report fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch your reports.' });
    }
});

// GET /api/hr/daily-report/summary - Admin/HR Summary View
router.get('/summary', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { date, hub, page = 1, limit = 50 } = req.query;
        const query = {};

        if (date) {
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0);
            query.reportDate = dateObj;
        }

        if (hub) query.hubName = hub;

        const skip = (page - 1) * limit;
        const reports = await DailyReport.find(query)
            .populate('employeeId', 'fullName mobile')
            .sort({ reportDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const totalCount = await DailyReport.countDocuments(query);

        const agg = await DailyReport.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalOFD: { $sum: '$ofd' },
                    totalDEL: { $sum: '$delivered' },
                    totalPICK: { $sum: '$picked' },
                    totalOFP: { $sum: '$ofp' }
                }
            }
        ]);

        const totals = agg[0] || { totalOFD: 0, totalDEL: 0, totalPICK: 0, totalOFP: 0 };
        const deliverySuccess = totals.totalOFD > 0 ? (totals.totalDEL / totals.totalOFD * 100).toFixed(2) : 0;

        res.json({
            reports,
            summary: {
                ...totals,
                deliverySuccess: `${deliverySuccess}%`
            },
            pagination: {
                total: totalCount,
                page: Number(page),
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary.' });
    }
});

module.exports = router;
