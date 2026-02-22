require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // CLEAR Existing test nodes to avoid conflicts and ensure fresh hash
        await User.deleteMany({
            $or: [
                { employeeId: 'Admin' },
                { employeeId: 'admin' },
                { fhrId: 'FHR-001' },
                { mobile: '9999999999' },
                { mobile: '9876543210' }
            ]
        });

        // CREATE Admin Manager
        const admin = new User({
            fullName: 'Admin Manager',
            employeeId: 'Admin',
            mobile: '9999999999',
            email: 'admin@anglecourier.com',
            password: 'admin123',
            role: 'admin',
            status: 'Active',
            isAccountActivated: true,
            designation: 'System Administrator',
            department: 'Administration',
            officeLocation: 'HQ',
        });
        await admin.save();
        console.log('✅ Admin Re-Synchronized: Admin / admin123');

        // CREATE Test Employee
        const emp = new User({
            fullName: 'Rahul Sharma',
            employeeId: 'EMP-001',
            mobile: '9876543210',
            email: 'rahul@anglecourier.com',
            password: 'emp123',
            role: 'employee',
            status: 'Active',
            isAccountActivated: true,
            designation: 'Delivery Associate',
            department: 'Operations',
            officeLocation: 'Delhi Hub',
            hubName: 'Delhi-NCR',
            baseRate: 15,
            conveyance: 500,
            fhrId: 'FHR-001',
            profileId: 'PRF-001',
        });
        await emp.save();
        console.log('✅ Employee Re-Synchronized: FHR-001 / emp123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
