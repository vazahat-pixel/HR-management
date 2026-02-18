const https = require('https');

function resolve(hostname) {
    return new Promise((resolve, reject) => {
        https.get(`https://dns.google/resolve?name=${hostname}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Answer && json.Answer.length > 0) {
                        resolve(json.Answer[0].data);
                    } else {
                        reject(new Error(`No Answer for ${hostname}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        const ip1 = await resolve('cluster0-shard-00-00.o4bsoot.mongodb.net');
        const ip2 = await resolve('cluster0-shard-00-01.o4bsoot.mongodb.net');
        const ip3 = await resolve('cluster0-shard-00-02.o4bsoot.mongodb.net');

        console.log(`Resolved IPs: ${ip1}, ${ip2}, ${ip3}`);

        const uri = `mongodb://wazahatqureshi4_db_user:wazahat123@${ip1}:27017,${ip2}:27017,${ip3}:27017/hrms?authSource=admin&replicaSet=atlas-1370e3-shard-0&tls=true&tlsAllowInvalidCertificates=true`;
        console.log(`Connection String: ${uri}`);

        // Try connecting
        const mongoose = require('mongoose');
        await mongoose.connect(uri);
        console.log('SUCCESS: Connected to MongoDB via IPs!');
        process.exit(0);
    } catch (err) {
        console.error('Resolution/Connection Failed:', err);
        process.exit(1);
    }
}

main();
