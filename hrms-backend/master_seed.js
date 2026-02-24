require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function masterSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testIds = ['TEST-001', 'TEST-002', 'TEST-003', 'FHR-001'];

        // Delete existing to avoid conflicts
        await User.deleteMany({ fhrId: { $in: testIds } });
        await User.deleteMany({ employeeId: 'Admin' });
        console.log('Cleared existing users.');

        const commonPass = await bcrypt.hash('password123', 12);
        const legacyPass = await bcrypt.hash('emp123', 12);
        const adminPass = await bcrypt.hash('admin123', 12);

        const users = [
            {
                fullName: 'HR Manager',
                employeeId: 'Admin',
                mobile: '9999999999',
                password: 'admin123', // Model will hash this
                role: 'admin',
                status: 'Active',
                isAccountActivated: true,
                designation: 'Admin'
            },
            {
                fullName: 'Rahul Sharma',
                fhrId: 'FHR-001',
                mobile: '9876543210',
                password: 'emp123', // Model will hash this
                role: 'employee',
                status: 'Active',
                isAccountActivated: true,
                designation: 'Delivery Associate'
            },
            {
                fullName: 'Laxman Kumar',
                fhrId: 'TEST-001',
                mobile: '1111111111',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isAccountActivated: true,
                designation: 'Field Agent'
            },
            {
                fullName: 'Amit Prajapati',
                fhrId: 'TEST-002',
                mobile: '2222222222',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isAccountActivated: true,
                designation: 'Delivery Associate'
            },
            {
                fullName: 'Suresh Raina',
                fhrId: 'TEST-003',
                mobile: '3333333333',
                password: 'password123',
                role: 'employee',
                status: 'Active',
                isAccountActivated: true,
                designation: 'Operations Executive'
            }
        ];

        // We use save() instead of insertMany to trigger the pre-save password hash
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created: ${userData.fhrId || userData.employeeId}`);
        }

        console.log('\n--- ALL TEST USERS SYNCED ---');
        console.log('Admin: Admin / admin123');
        console.log('Employee 1: FHR-001 / emp123');
        console.log('Employee 2: TEST-003 / password123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}
masterSeed();
