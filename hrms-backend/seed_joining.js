async function seedJoiningRequests() {
    const API_URL = 'http://localhost:5000/api/auth/new-joining';

    const employees = [
        "Aarav Sharma", "Vivaan Gupta", "Aditya Singh", "Vihaan Verma",
        "Arjun Mehra", "Sai Reddy", "Reyansh Malhotra", "Aaryan Khan",
        "Ishaan Joshi", "Krishna Nair", "Shaurya Kapoor", "Aryan Saxena"
    ];

    console.log(`Starting to seed ${employees.length} joining requests...`);

    for (let i = 0; i < employees.length; i++) {
        const name = employees[i];
        const mobile = `90000000${(i + 10).toString().slice(0, 2)}`;
        const email = `employee${i + 1}@pafms.com`;

        const payload = {
            fullName: name,
            fatherName: "Father of " + name,
            dob: "1995-01-01",
            gender: "Male",
            mobile: mobile,
            email: email,
            address: `${i + 1} Main St, City`,
            hubName: "Main Hub",
            officeLocation: "Branch A",
            aadhaar: `1234123412${(i + 10).toString().slice(0, 2)}`,
            pan: `ABCDE12${(i + 10).toString().slice(0, 2)}F`,
            accountName: name,
            accountNumber: `9876543210${i}`,
            ifscCode: "HDFC0001234",
            profileId: `PRID-${1000 + i}`
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`[${i + 1}/12] Success: ${name} (${mobile})`);
            } else {
                console.error(`[${i + 1}/12] Failed: ${name} - ${data.error}`);
            }
        } catch (error) {
            console.error(`[${i + 1}/12] Error: ${name} - ${error.message}`);
        }
    }
    console.log('Seeding complete.');
}

seedJoiningRequests();
