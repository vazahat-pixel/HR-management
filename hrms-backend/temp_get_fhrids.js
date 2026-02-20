const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({ fhrId: String, fullName: String, role: String }));
        const users = await User.find({ role: 'employee' }, { fhrId: 1, fullName: 1 }).limit(5);
        console.log('---SAMPLE_EMPLOYEES---');
        console.log(JSON.stringify(users, null, 2));
        console.log('---END---');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
