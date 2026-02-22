require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function list() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
        console.log(`- ${u.fullName} | ID: ${u.employeeId} | FHR: ${u.fhrId} | Role: ${u.role}`);
    });
    process.exit(0);
}
list();
