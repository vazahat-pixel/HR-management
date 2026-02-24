require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Checking TEST-003 ---');
    const user = await User.findOne({ fhrId: 'TEST-003' });
    if (user) {
        console.log('✅ TEST-003 found!');
        console.log('Role:', user.role);
        console.log('Status:', user.status);
        console.log('Activated:', user.isAccountActivated);
        const match = await bcrypt.compare('password123', user.password);
        console.log('Password match (password123):', match);
    } else {
        console.log('❌ TEST-003 NOT FOUND in database');
    }

    console.log('\n--- Checking FHR-001 ---');
    const emp = await User.findOne({ fhrId: 'FHR-001' });
    if (emp) {
        console.log('✅ FHR-001 found!');
        const match = await bcrypt.compare('emp123', emp.password);
        console.log('Password match (emp123):', match);
    } else {
        console.log('❌ FHR-001 NOT FOUND in database');
    }

    process.exit(0);
}
check();
