require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DailyReport = require('./models/DailyReport');
const PayoutReport = require('./models/PayoutReport');
const Payslip = require('./models/Payslip');
const JoiningRequest = require('./models/JoiningRequest');
const Notification = require('./models/Notification');
const AdvanceRequest = require('./models/AdvanceRequest');
const Complaint = require('./models/Complaint');

async function resetDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 1. Delete All Data
        console.log('Cleaning up existing data...');
        await User.deleteMany({});
        await DailyReport.deleteMany({});
        await PayoutReport.deleteMany({});
        await Payslip.deleteMany({});
        await JoiningRequest.deleteMany({});
        await Notification.deleteMany({});
        await AdvanceRequest.deleteMany({});
        await Complaint.deleteMany({});
        console.log('All data cleared.');

        // 2. Create Admin User
        const admin = await User.create({
            fullName: "Test Admin",
            mobile: "9999999999",
            email: "admin@test.com",
            password: "Admin@123",
            employeeId: "ADMIN-2026-0001",
            role: "admin",
            status: "Active",
            isApproved: true,
            isAccountActivated: true,
            designation: "Super Admin"
        });
        console.log('Admin Created: ID: ADMIN-2026-0001 / Pass: Admin@123');

        // 3. Create Employee User
        const employee = await User.create({
            fullName: "Test Employee",
            mobile: "8888888888",
            email: "employee@test.com",
            password: "User@123",
            employeeId: "EMP-2026-0002",
            fhrId: "FHR-TEST-001", // This is crucial for report mapping
            role: "employee",
            status: "Active",
            isAccountActivated: true,
            isApproved: true,
            designation: "Delivery Executive",
            hubName: "Main Hub"
        });
        console.log('Employee Created: ID: EMP-2026-0002 / Pass: User@123 / FHRID: FHR-TEST-001');

        console.log('\n--- Setup Complete ---');
        console.log('Testing Instructions:');
        console.log('1. Login as Admin.');
        console.log('2. Upload Daily Report Excel (Headers: CasperFHRID, Full_Name, OFD, DEL, PICK). Use FHRID: FHR-TEST-001');
        console.log('3. Upload Payout Report Excel (Headers: FHRID, WM Name, Working Days, Total Pay Amount). Use FHRID: FHR-TEST-001');
        console.log('4. Upload Salary Slip Excel (Headers: FHRID, Employee_Name, Net_Payable). Use FHRID: FHR-TEST-001');
        console.log('5. Login as Employee and verify all 3 sections see their own data.');

        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

resetDB();
