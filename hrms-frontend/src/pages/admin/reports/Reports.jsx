import React from 'react';
import { motion } from 'framer-motion';

const Reports = () => {
    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">System Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Payroll Summary', 'Employee Turnover', 'Performance Analytics'].map((report, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors"
                    >
                        <div className="h-40 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center text-slate-600">
                            Chart Preview
                        </div>
                        <h3 className="text-lg font-bold text-white">{report}</h3>
                        <p className="text-slate-500 text-sm mt-1">Export detailed insights as PDF or CSV.</p>
                        <button className="mt-4 text-xs font-bold text-primary-500 uppercase tracking-wider">Generate Report &rarr;</button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
