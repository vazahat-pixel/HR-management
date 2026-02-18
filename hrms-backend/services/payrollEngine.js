const DailyReport = require('../models/DailyReport');
const AdvanceRequest = require('../models/AdvanceRequest');
const User = require('../models/User');
const SalaryStructure = require('../models/SalaryStructure');

/**
 * Calculate monthly payout for an employee
 * Follows the exact calculation rules from requirements
 */
const calculateMonthlyPayout = async (userId, month, year) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all daily reports for this month
    const reports = await DailyReport.find({
        employeeId: userId,
        reportDate: { $gte: startDate, $lte: endDate }
    });

    const workingDays = reports.length;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const lopDays = totalDaysInMonth - workingDays;

    // Aggregate counts from daily reports
    let totalDelivered = 0;
    let totalPicked = 0;
    let totalOfd = 0;

    reports.forEach(r => {
        totalDelivered += r.delivered || 0;
        totalPicked += r.picked || 0;
        totalOfd += r.ofd || 0;
    });

    const salary = await SalaryStructure.findOne({ userId });
    const baseRate = salary ? salary.baseRate : (user.baseRate || 0);
    const conveyance = salary ? salary.conveyance : (user.conveyance || 0);
    const incentiveRate = salary ? salary.incentiveRate : 0;
    const tdsRate = salary ? salary.tdsRate : 1;

    // Calculation as per requirements
    // Basic Pay = Working Days * daily base rate
    const basic = workingDays * baseRate;

    // Incentives = total delivered * incentive rate
    const incentives = totalDelivered * incentiveRate;

    // Final Base Amount for TDS calculation (Standard logic)
    const finalBaseAmount = basic + incentives;

    // TDS = (Basic + Incentives) × tdsRate%
    const tds = Math.round(finalBaseAmount * (tdsRate / 100) * 100) / 100;

    // Get approved advance for this month (using approvedAt date)
    const advances = await AdvanceRequest.find({
        userId,
        status: 'Approved',
        approvedAt: { $gte: startDate, $lte: endDate }
    });
    const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);

    // Gross Earnings = Basic + Conveyance + Incentives
    const grossEarnings = basic + conveyance + incentives;

    // Total Deductions = TDS + Advance
    const totalDeductions = tds + totalAdvance;

    // Total Pay Amount (Net) = Gross Earnings - Total Deductions
    const totalPayAmount = Math.round((grossEarnings - totalDeductions) * 100) / 100;

    return {
        userId,
        month,
        year,
        profileId: user.profileId || user.employeeId,
        wmName: user.fullName,
        hubName: user.hubName || '',
        fhrId: user.fhrId || '',
        workingDays,
        deliveredCount: totalDelivered,
        pickedCount: totalPicked,
        baseRate,
        basic,
        conveyance,
        incentives,
        finalBaseAmount,
        tds,
        advance: totalAdvance,
        grossEarnings,
        totalDeductions,
        netPayable: totalPayAmount,
        totalPayAmount, // For backward compatibility with PayoutReport
        paidDays: workingDays,
        lopDays,
        employeeName: user.fullName,
        employeeId: user.employeeId,
        designation: user.designation,
        department: user.department,
    };
};

module.exports = { calculateMonthlyPayout };
