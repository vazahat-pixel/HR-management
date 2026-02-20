const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function recreateTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testFhrIds = ['TEST-001', 'TEST-002', 'TEST-003'];

        // Delete existing test users to avoid conflict
        await User.deleteMany({ fhrId: { $in: testFhrIds } });
        console.log('Deleted old test users.');

        const hashedPassword = await bcrypt.hash('password123', 12);

        const testUsers = [
            {
                fullName: 'Laxman Kumar',
                employeeId: 'EMP-T1',
                fhrId: 'TEST-001',
                mobile: '1111111111',
                password: hashedPassword,
                role: 'employee',
                status: 'Active',
                isApproved: true,
                isAccountActivated: true,
                isProfileCompleted: true,
                designation: 'Field Agent'
            },
            {
                fullName: 'Amit Prajapati',
                employeeId: 'EMP-T2',
                fhrId: 'TEST-002',
                mobile: '2222222222',
                password: hashedPassword,
                role: 'employee',
                status: 'Active',
                isApproved: true,
                isAccountActivated: true,
                isProfileCompleted: true,
                designation: 'Delivery Associate'
            },
            {
                fullName: 'Suresh Raina',
                employeeId: 'EMP-T3',
                fhrId: 'TEST-003',
                mobile: '3333333333',
                password: hashedPassword,
                role: 'employee',
                status: 'Active',
                isApproved: true,
                isAccountActivated: true,
                isProfileCompleted: true,
                designation: 'Operations Executive'
            }
        ];

        await User.insertMany(testUsers);
        console.log('✅ Created 3 fresh test users with hashed passwords.');

        process.exit(0);
    } catch (error) {
        console.error('Recreate error:', error);
        process.exit(1);
    }
}

recreateTestUsers();
