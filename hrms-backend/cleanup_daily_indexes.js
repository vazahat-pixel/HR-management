const mongoose = require('mongoose');
require('dotenv').config();

const cleanupIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const DailyReport = mongoose.connection.collection('dailyreports');

        console.log('Current Indexes:');
        const indexes = await DailyReport.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        // Drop index by name if it exists, or pattern
        // The error mentioned { userId: 1, date: 1 }
        // Let's try to drop all except _id_ and then re-sync

        for (const index of indexes) {
            if (index.name !== '_id_') {
                console.log(`Dropping index: ${index.name}`);
                await DailyReport.dropIndex(index.name);
            }
        }

        console.log('✅ All non-ID indexes dropped.');
        console.log('Closing connection...');
        await mongoose.disconnect();

        process.exit(0);
    } catch (err) {
        console.error('Cleanup Error:', err);
        process.exit(1);
    }
};

cleanupIndexes();
