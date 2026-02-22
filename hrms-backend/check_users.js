require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ fhrId: 'FHR-001' });
    console.log('Users found:', users.length);
    if (users.length > 0) {
        const user = users[0];
        console.log('User:', user.fhrId, user.role, user.status, user.isAccountActivated);
        const match = await bcrypt.compare('emp123', user.password);
        console.log('Password match (emp123):', match);
    }

    const admins = await User.find({ employeeId: 'Admin' });
    console.log('Admins found:', admins.length);
    if (admins.length > 0) {
        const admin = admins[0];
        console.log('Admin:', admin.employeeId, admin.role, admin.isAccountActivated);
        const match = await bcrypt.compare('admin123', admin.password);
        console.log('Password match (admin123):', match);
    } else {
        console.log('Admin NOT FOUND in database');
    }
    process.exit(0);
}
check();
