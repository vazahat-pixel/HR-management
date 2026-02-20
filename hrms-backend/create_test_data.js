const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function seedTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testUsers = [
            {
                fullName: 'Laxman Kumar',
                employeeId: 'EMP-T1',
                fhrId: 'TEST-001',
                mobile: '1111111111',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isProfileCompleted: true,
                designation: 'Field Agent'
            },
            {
                fullName: 'Amit Prajapati',
                employeeId: 'EMP-T2',
                fhrId: 'TEST-002',
                mobile: '2222222222',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isProfileCompleted: true,
                designation: 'Delivery Associate'
            },
            {
                fullName: 'Suresh Raina',
                employeeId: 'EMP-T3',
                fhrId: 'TEST-003',
                mobile: '3333333333',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isProfileCompleted: true,
                designation: 'Operations Executive'
            }
        ];

        for (const userData of testUsers) {
            await User.findOneAndUpdate(
                { fhrId: userData.fhrId },
                userData,
                { upsert: true, new: true }
            );
            console.log(`✅ Created/Updated: ${userData.fullName} (FHRID: ${userData.fhrId})`);
        }

        console.log('\n--- TESTING SUMMARY ---');
        console.log('Use FHR-IDs: TEST-001, TEST-002, TEST-003');
        console.log('Password for all: password123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedTestUsers();
