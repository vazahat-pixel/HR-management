const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/company/details — Get company information
router.get('/details', async (req, res) => {
    try {
        let company = await Company.findOne();

        // If no company exists, create default
        if (!company) {
            company = await Company.create({
                name: 'ANGLE COURIER',
                primaryColor: '#0F766E'
            });
        }

        res.json(company);
    } catch (error) {
        console.error('Get company details error:', error);
        // Return default if error occurs
        res.json({ name: 'ANGLE COURIER', primaryColor: '#0F766E' });
    }
});

// PUT /api/company/details — Update company information (Admin only)
router.put('/details', async (req, res) => {
    try {
        const { name, logo, primaryColor, address, contact, email } = req.body;

        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({ name, logo, primaryColor, address, contact, email });
        } else {
            Object.assign(company, { name, logo, primaryColor, address, contact, email });
            await company.save();
        }

        res.json({ message: 'Company details updated successfully', company });
    } catch (error) {
        console.error('Update company details error:', error);
        res.status(500).json({ error: 'Failed to update company details' });
    }
});

module.exports = router;
