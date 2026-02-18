const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { maskAadhaar, maskPan } = require('../middleware/encrypt');

// GET /api/employees — Admin: get all employees
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { search, status, department, page = 1, limit = 20 } = req.query;
        const filter = { role: 'employee' };

        if (status) filter.status = status;
        if (department) filter.department = department;
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(filter);
        const employees = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Mask sensitive data
        const masked = employees.map(emp => {
            const obj = emp.toJSON();
            obj.aadhaarMasked = maskAadhaar(emp.aadhaar);
            obj.panMasked = maskPan(emp.pan);
            return obj;
        });

        res.json({ employees: masked, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees.' });
    }
});

// GET /api/employees/:id — Get specific employee
router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id).select('-password');
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });

        const obj = employee.toJSON();
        obj.aadhaarMasked = maskAadhaar(employee.aadhaar);
        obj.panMasked = maskPan(employee.pan);

        res.json({ employee: obj });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee.' });
    }
});

// PUT /api/employees/:id — Update employee
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password; // Can't update password through this route
        delete updates.role;     // Can't change role

        const employee = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });

        res.json({ message: 'Employee updated.', employee: employee.toJSON() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee.' });
    }
});

// DELETE /api/employees/:id — Delete employee
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const employee = await User.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });

        res.json({ message: 'Employee deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete employee.' });
    }
});

module.exports = router;
