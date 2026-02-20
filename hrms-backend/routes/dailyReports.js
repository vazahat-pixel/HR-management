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

const Notification = require('../models/Notification');

// POST /api/hr/daily-report/upload - HR Only (Bulk Excel)
router.post('/upload', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload an Excel file' });
        const { reportDate } = req.body;
        if (!reportDate) return res.status(400).json({ error: 'Report date is required' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            skippedFhrids: []
        };

        const reportsToInsert = [];
        const dateObj = new Date(reportDate);
        dateObj.setHours(0, 0, 0, 0);

        // Utility to find case-insensitive keys
        const getVal = (row, candidates) => {
            const keys = Object.keys(row);
            for (const cand of candidates) {
                const key = keys.find(k => k.toLowerCase().replace(/[\s_]/g, '') === cand.toLowerCase().replace(/[\s_]/g, ''));
                if (key) return row[key];
            }
            return undefined;
        };

        const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        for (const row of data) {
            // Mapping Casper Ledger Headers
            const fhrid = getVal(row, ['CasperFHRID', 'FHRID', 'fhrid'])?.toString().trim();
            const fullName = getVal(row, ['Full_Name', 'FullName', 'Name'])?.toString().trim();
            const hubName = getVal(row, ['HubName', 'Hub Name', 'Hub'])?.toString().trim();
            const ofd = Number(getVal(row, ['OFD'])) || 0;
            const ofp = Number(getVal(row, ['OFP'])) || 0;
            const del = Number(getVal(row, ['DEL', 'Delivered'])) || 0;
            const pick = Number(getVal(row, ['PICK', 'Picked'])) || 0;

            if (!fhrid) {
                results.failed++;
                continue;
            }

            const user = await User.findOne({ fhrId: { $regex: new RegExp(`^${fhrid}$`, 'i') } });
            if (!user) {
                results.failed++;
                results.skippedFhrids.push(fhrid);
                continue;
            }

            // Prepare record
            const reportData = {
                fhrid,
                full_name: fullName || user.fullName,
                hub_name: hubName,
                ofd, ofp,
                delivered: del,
                picked: pick,
                reportDate: dateObj
            };

            try {
                // Upsert to handle existing reports for same date
                await DailyReport.findOneAndUpdate(
                    { fhrid, reportDate: dateObj },
                    reportData,
                    { upsert: true, new: true }
                );

                // Create Notification for Employee
                await Notification.create({
                    userId: user._id,
                    title: 'New Daily Performance Report',
                    message: `Your performance report for ${formattedDate} has been uploaded. DEL: ${del}, OFD: ${ofd}.`,
                });

                results.success++;
            } catch (err) {
                console.error(`Error processing row for ${fhrid}:`, err);
                results.failed++;
            }
        }

        res.json({
            message: `Processed ${data.length} rows.`,
            summary: results
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/employee/daily-report - Employee View Own (STRICT FHRID ISOLATION)
const { authorizeEmployee } = require('../middleware/auth');

router.get('/employee', authenticate, authorizeEmployee, async (req, res) => {
    try {
        if (!req.user.fhrId) {
            return res.json({ reports: [], message: 'FHRID not assigned to your profile.' });
        }

        const reports = await DailyReport.find({ fhrid: req.user.fhrId })
            .sort({ reportDate: -1 });

        res.json({ reports });
    } catch (error) {
        console.error('Employee report fetch error:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// GET /api/hr/daily-report/summary - Admin View
router.get('/summary', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { date } = req.query;
        const query = {};
        if (date) {
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0);
            query.reportDate = dateObj;
        }

        const reports = await DailyReport.find(query).sort({ reportDate: -1 });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

const pdfService = require('../services/pdfService');

// GET /api/employee/daily-report/:id/download - Employee Download Receipt
router.get('/:id/download', authenticate, authorizeEmployee, async (req, res) => {
    try {
        const report = await DailyReport.findById(req.params.id);
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Security check: Only the owner can download
        if (report.fhrid !== req.user.fhrId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const pdfPath = await pdfService.generateDailyReportReceipt(report, req.user);
        res.download(pdfPath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to generate receipt' });
    }
});

module.exports = router;
