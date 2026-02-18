require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ employeeId: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists. Skipping seed.');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            fullName: 'Admin Manager',
            employeeId: 'Admin',
            mobile: '9999999999',
            email: 'admin@anglecourier.com',
            password: 'Admin123',
            role: 'admin',
            status: 'Active',
            designation: 'System Administrator',
            department: 'Administration',
            officeLocation: 'HQ',
        });
        console.log('✅ Admin created:', admin.employeeId, '/ admin123');

        // Create test employee
        const emp = await User.create({
            fullName: 'Rahul Sharma',
            employeeId: 'EMP-001',
            mobile: '9876543210',
            email: 'rahul@anglecourier.com',
            password: 'emp123',
            role: 'employee',
            status: 'Active',
            designation: 'Delivery Associate',
            department: 'Operations',
            officeLocation: 'Delhi Hub',
            hubName: 'Delhi-NCR',
            baseRate: 15,
            conveyance: 500,
            fhrId: 'FHR-001',
            profileId: 'PRF-001',
        });
        console.log('✅ Employee created:', emp.employeeId, '/ emp123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
