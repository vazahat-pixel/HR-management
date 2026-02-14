import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentReport, HiOutlineDownload } from 'react-icons/hi';

const Reports = () => {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Performance Reports</h1>
                    <p className="text-slate-400 text-sm mt-1">View and download your monthly performance analytics.</p>
                </div>
                <button
                    onClick={() => alert("Dummy Action: Exporting All Reports...")}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
                >
                    <HiOutlineDownload className="w-4 h-4" />
                    Export All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                        className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-primary-500/50 transition-all group cursor-pointer"
                        onClick={() => alert(`Dummy Action: View Report details for Month ${item}`)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors mb-4">
                            <HiOutlineDocumentReport className="w-6 h-6" />
                        </div>
                        <h3 className="text-white font-semibold">Monthly Report - {['Jan', 'Feb', 'Mar'][item - 1]} 2026</h3>
                        <p className="text-slate-500 text-xs mt-1">Generated on 1st of month</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
