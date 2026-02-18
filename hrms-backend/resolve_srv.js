const https = require('https');

function query(name, type = 1) {
    return new Promise((resolve, reject) => {
        https.get(`https://dns.google/resolve?name=${name}&type=${type}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Answer) {
                        resolve(json.Answer);
                    } else {
                        reject(new Error(`No Answer for ${name} type ${type}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function resolveIP(name) {
    return query(name, 1).then(answers => answers[0].data);
}

async function main() {
    try {
        console.log('Querying SRV record...');
        // SRV type is 33
        const srvRecords = await query('_mongodb._tcp.cluster0.o4bsoot.mongodb.net', 33);

        console.log('SRV Records found:', srvRecords.length);

        const hosts = srvRecords.map(r => {
            // SRV data format: priority weight port target
            const parts = r.data.split(' ');
            return {
                port: parts[2],
                target: parts[3]
            };
        });

        console.log('Targets:', hosts);

        // Resolve IPs for each target
        const resolvedHosts = [];
        for (const h of hosts) {
            // Remove trailing dot if present
            const target = h.target.endsWith('.') ? h.target.slice(0, -1) : h.target;
            console.log(`Resolving IP for ${target}...`);
            try {
                const ip = await resolveIP(target);
                resolvedHosts.push(`${ip}:${h.port}`);
                console.log(`  -> ${ip}`);
            } catch (e) {
                console.error(`  -> Failed: ${e.message}`);
            }
        }

        if (resolvedHosts.length === 0) throw new Error('Could not resolve any host IPs');

        const uri = `mongodb://wazahatqureshi4_db_user:wazahat123@${resolvedHosts.join(',')}/hrms?authSource=admin&tls=true&tlsAllowInvalidCertificates=true`;
        console.log('\nGenerated Connection String:');
        console.log(uri);

    } catch (err) {
        console.error('Failed:', err.message);
    }
}

main();
