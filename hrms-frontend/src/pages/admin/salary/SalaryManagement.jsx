import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCash,
    HiOutlineCheckCircle,
    HiOutlineRefresh,
    HiOutlineDownload,
    HiOutlineShieldCheck,
    HiOutlineDotsVertical
} from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const payrollData = [
    { name: 'John Doe', id: 'EMP-001', base: '$4,250', bonus: '$150', total: '$4,400', status: 'Approved', period: 'Feb 2026' },
    { name: 'Sarah Wilson', id: 'EMP-002', base: '$3,800', bonus: '$0', total: '$3,800', status: 'Pending', period: 'Feb 2026' },
    { name: 'Michael Chen', id: 'EMP-003', base: '$5,100', bonus: '$500', total: '$5,600', status: 'Processed', period: 'Feb 2026' },
    { name: 'Alina Becker', id: 'EMP-004', base: '$3,200', bonus: '$120', total: '$3,320', status: 'Approved', period: 'Feb 2026' },
    { name: 'James Roddy', id: 'EMP-005', base: '$4,500', bonus: '$0', total: '$4,500', status: 'On Hold', period: 'Feb 2026' },
];

const AdminSalary = () => {
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);

    const handleViewPayslip = (row) => {
        setSelectedPayslip(row);
        setIsPayslipModalOpen(true);
    };

    const handleRunPayroll = () => {
        setIsProcessModalOpen(true);
        setProcessProgress(0);
        // Simulate progress
        const interval = setInterval(() => {
            setProcessProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Payroll Engine</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Global salary distribution and tax compliance</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRunPayroll}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        Run Instant Payroll
                    </button>
                    <button
                        onClick={() => alert("Dummy Action: Re-syncing with payroll provider...")}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <HiOutlineRefresh className="w-4 h-4" />
                        Re-sync
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 rounded-xl p-5 border border-indigo-500/20 lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <HiOutlineShieldCheck className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/70">Total Monthly Liability (Feb 2026)</span>
                    </div>

                    <h3 className="text-3xl font-bold text-white tracking-tight mb-5 relative z-10">$842,500.00</h3>

                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        <div className="bg-black/20 rounded-lg p-3 border border-white/5 backdrop-blur-sm cursor-pointer hover:bg-black/30 transition-colors" onClick={() => alert("Dummy Action: View Base Salary Details")}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200/50 mb-0.5">Base Salary</p>
                            <p className="text-sm font-semibold text-white">$780k</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3 border border-white/5 backdrop-blur-sm cursor-pointer hover:bg-black/30 transition-colors" onClick={() => alert("Dummy Action: View Variable Pay Details")}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200/50 mb-0.5">Variable</p>
                            <p className="text-sm font-semibold text-white">$42k</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3 border border-white/5 backdrop-blur-sm cursor-pointer hover:bg-black/30 transition-colors" onClick={() => alert("Dummy Action: View Tax Details")}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200/50 mb-0.5">Taxes</p>
                            <p className="text-sm font-semibold text-white">$20.5k</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
                    <h4 className="text-sm font-bold text-zinc-100 mb-4">Payroll Status</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Funds Authorized', percentage: 94, color: 'bg-emerald-500' },
                            { label: 'Disbursement Progress', percentage: 68, color: 'bg-indigo-500' },
                            { label: 'Tax Filings', percentage: 100, color: 'bg-blue-500' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-1.5 cursor-pointer" onClick={() => alert(`Dummy Action: View ${item.label} details`)}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-500">{item.label}</span>
                                    <span className="text-[10px] font-bold text-zinc-300">{item.percentage}%</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                                        className={`h-full ${item.color}`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100">Individual Payouts</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => alert("Dummy Action: Downloading Payroll Report...")}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => alert("Dummy Action: Batch Action Triggered (e.g., Approve All)")}
                            className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/20 uppercase tracking-widest hover:bg-indigo-500/20 transition-colors cursor-pointer"
                        >
                            Batch Action
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-900 border-b border-zinc-800">
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Employee</th>
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Period</th>
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Base</th>
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Bonus</th>
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total Net</th>
                                <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {payrollData.map((row, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                                    onClick={() => handleViewPayslip(row)}
                                >
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700">
                                                {row.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">{row.name}</p>
                                                <p className="text-[9px] text-zinc-500">{row.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-xs text-zinc-400">{row.period}</td>
                                    <td className="py-2.5 px-4 text-xs text-zinc-300 font-medium">{row.base}</td>
                                    <td className="py-2.5 px-4 text-xs text-emerald-500 font-medium">{row.bonus}</td>
                                    <td className="py-2.5 px-4 text-xs text-white font-bold">{row.total}</td>
                                    <td className="py-2.5 px-4 text-right">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide ${row.status === 'Processed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            row.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                row.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payslip Modal */}
            <Modal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                title="Payslip Details"
                maxWidth="max-w-xl"
            >
                {selectedPayslip && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedPayslip.name}</h3>
                                <p className="text-xs text-zinc-400">{selectedPayslip.id} • {selectedPayslip.period}</p>
                            </div>
                            <button className="text-xs flex items-center gap-1 text-primary-500 hover:text-primary-400 font-bold">
                                <HiOutlineDownload /> Download PDF
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">Earnings</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Base Salary</span>
                                    <span className="text-zinc-200">{selectedPayslip.base}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Housing Allowance</span>
                                    <span className="text-zinc-200">$500</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Transport</span>
                                    <span className="text-zinc-200">$200</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Bonus</span>
                                    <span className="text-zinc-200">{selectedPayslip.bonus}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">Deductions</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Tax (Income)</span>
                                    <span className="text-zinc-200">$450</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Health Insurance</span>
                                    <span className="text-zinc-200">$120</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Pension</span>
                                    <span className="text-zinc-200">$300</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-sm font-bold text-emerald-500">Net Pay</span>
                            <span className="text-xl font-bold text-white">{selectedPayslip.total}</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Run Payroll Process Modal */}
            <Modal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                title="Processing Payroll"
                maxWidth="max-w-md"
            >
                <div className="space-y-6 text-center py-4">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-zinc-800 stroke-current"
                                strokeWidth="8"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                            ></circle>
                            <circle
                                className="text-emerald-500 progress-ring__circle stroke-current transition-all duration-300 ease-in-out"
                                strokeWidth="8"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * processProgress) / 100}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                            {processProgress}%
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white">{processProgress < 100 ? 'Calculating...' : 'Completed!'}</h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            {processProgress < 30 ? 'Aggregating employee hours...' :
                                processProgress < 60 ? 'Calculating taxes and deductions...' :
                                    processProgress < 90 ? 'Generating payslips...' :
                                        'Payroll run finish successfully.'}
                        </p>
                    </div>

                    {processProgress === 100 && (
                        <button
                            onClick={() => setIsProcessModalOpen(false)}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                        >
                            View Summary
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AdminSalary;

