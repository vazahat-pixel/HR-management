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
    const [downloadingId, setDownloadingId] = useState(null);

    const handleDownload = async (salary, index) => {
        if (isDownloading) return;

        setDownloadingId(index);
        setSelectedSalary(salary);

        setTimeout(async () => {
            await downloadPDF(templateRef, salary, user);
            setDownloadingId(null);
        }, 500);
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
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Base Salary</p>
                            <p className="font-bold text-zinc-200 mt-1">$4,250</p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
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
                    <button className="text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors">Yearly Summary</button>
                </div>

                <div className="space-y-2">
                    {salaryData.map((salary, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.99 }}
                            className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center justify-between group"
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
                                onClick={() => handleDownload(salary, i)}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
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
                <button className="text-[10px] font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors">
                    Contact Payroll
                </button>
            </div>
        </div>
    );
};

export default SalarySlip;
