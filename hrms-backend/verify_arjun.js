require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ fullName: 'Arjun Gupta' });
    if (user) {
        console.log('User found:', user.fullName, user.fhrId);
        const passwords = ['Password@123', 'password123', 'emp123', 'Pending123'];
        for (const p of passwords) {
            const match = await bcrypt.compare(p, user.password);
            console.log(`Password ${p}: ${match}`);
        }
    } else {
        console.log('User not found');
    }
    process.exit(0);
}
test();
