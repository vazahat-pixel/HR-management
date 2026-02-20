const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({
            fhrId: { $exists: true, $ne: '', $ne: null }
        }).limit(5).toArray();

        console.log('---USERS_START---');
        console.log(JSON.stringify(users.map(u => ({ fhrId: u.fhrId, fullName: u.fullName })), null, 2));
        console.log('---USERS_END---');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
