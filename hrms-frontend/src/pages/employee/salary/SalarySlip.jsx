import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCash,
    HiOutlineDownload,
    HiOutlineTrendingUp,
    HiOutlineDocumentText,
    HiOutlineRefresh
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { usePayslipDownload } from './usePayslipDownload';
import PayslipTemplate from './PayslipTemplate';
import { cn } from '../../../lib/utils';
import Modal from '../../../components/common/Modal';

const salaryData = [
    { month: 'February 2026', amount: '$4,520.00', status: 'Paid', date: 'Feb 01, 2026', type: 'Regular', color: 'text-emerald-500' },
    { month: 'January 2026', amount: '$4,250.00', status: 'Paid', date: 'Jan 01, 2026', type: 'Regular', color: 'text-emerald-500' },
    { month: 'December 2025', amount: '$4,250.00', status: 'Paid', date: 'Dec 01, 2025', type: 'Bonus', color: 'text-emerald-500' },
    { month: 'November 2025', amount: '$4,100.00', status: 'Paid', date: 'Nov 01, 2025', type: 'Regular', color: 'text-emerald-500' },
];

const SalarySlip = () => {
    const { user } = useAuth();
    const templateRef = useRef(null);
    const { isDownloading, downloadPDF } = usePayslipDownload();
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const handleDownload = async (salary, index) => {
        if (isDownloading) return;

        setDownloadingId(index);
        // setSelectedSalary(salary); // Logic might conflict if we use selectedSalary for both modal and download

        // Dummy Action Alert
        console.log(`Dummy Action: Downloading payslip for ${salary.month}`);

        setTimeout(async () => {
            // Ideally call actual download, but for now we keep it
            // await downloadPDF(templateRef, salary, user);
            alert(`Dummy Action: Payslip for ${salary.month} downloaded successfully (Mock)`);
            setDownloadingId(null);
        }, 1000);
    };

    const handleViewPayslip = (salary) => {
        setSelectedSalary(salary);
        setIsPayslipModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-20">
            {/* Template container */}
            <div
                className="fixed left-0 top-0 opacity-0 pointer-events-none overflow-hidden z-[-1]"
                style={{ width: '794px', height: '1123px' }}
            >
                <PayslipTemplate ref={templateRef} data={selectedSalary} user={user} />
            </div>

            {/* Earnings Overview Card */}
            <div className="p-5 rounded-xl bg-[#0c0a09] border border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-800/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 rounded bg-zinc-800 text-zinc-400">
                            <HiOutlineCash className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Verified Earnings</span>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">$4,520.00</h2>
                        <span className="text-xs font-medium text-emerald-500 mb-1.5 flex items-center gap-1">
                            <HiOutlineTrendingUp className="w-3 h-3" />
                            +6.4%
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 h-full">
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => alert("Dummy Action: View Base Salary Details (Use History for full view)")}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Base Salary</p>
                            <p className="font-bold text-zinc-200 mt-1">$4,250</p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => alert("Dummy Action: View Bonus Details (Use History for full view)")}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Bonuses</p>
                            <p className="font-bold text-zinc-200 mt-1">$270</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Payment History</h2>
                    <button
                        onClick={() => alert("Dummy Action: View Yearly Summary")}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Yearly Summary
                    </button>
                </div>

                <div className="space-y-2">
                    {salaryData.map((salary, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleViewPayslip(salary)}
                            className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 border border-zinc-700/50 group-hover:text-zinc-300 transition-colors">
                                    <HiOutlineDocumentText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{salary.month}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-medium text-zinc-500">{salary.date}</span>
                                        <span className="w-0.5 h-0.5 bg-zinc-700 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{salary.type}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isDownloading}
                                onClick={(e) => { e.stopPropagation(); handleDownload(salary, i); }}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all border cursor-pointer",
                                    downloadingId === i
                                        ? "bg-zinc-100 text-black border-zinc-100"
                                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                                )}
                            >
                                {downloadingId === i ? (
                                    <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                                ) : (
                                    <HiOutlineDownload className="w-4 h-4" />
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Support Action */}
            <div className="bg-zinc-900/30 p-4 rounded-xl border border-dashed border-zinc-800 flex items-center justify-between">
                <p className="text-[10px] font-medium text-zinc-500">
                    Questions about your salary?
                </p>
                <button
                    onClick={() => alert("Dummy Action: Contacting Payroll Support...")}
                    className="text-[10px] font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                >
                    Contact Payroll
                </button>
            </div>

            {/* Payslip Modal */}
            <Modal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                title="Payslip Details"
                maxWidth="max-w-xl"
            >
                {selectedSalary && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedSalary.month}</h3>
                                <p className="text-xs text-zinc-400">{selectedSalary.date} • {selectedSalary.type}</p>
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
                                    <span className="text-zinc-200">$4,250</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Housing Allowance</span>
                                    <span className="text-zinc-200">$500</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Transport</span>
                                    <span className="text-zinc-200">$200</span>
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
                            <div className="flex flex-col">
                                <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Net Pay</span>
                                <span className="text-xs text-emerald-500/70">Credited to Bank Account</span>
                            </div>
                            <span className="text-2xl font-bold text-white">{selectedSalary.amount}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalarySlip;
