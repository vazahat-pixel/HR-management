require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function list() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, 'fullName fhrId employeeId mobile role');
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => {
        console.log(`ID: ${u.fhrId || u.employeeId} | Name: ${u.fullName} | Mobile: ${u.mobile} | Role: ${u.role}`);
    });
    process.exit(0);
}
list();
