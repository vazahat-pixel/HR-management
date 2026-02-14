import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentDownload, HiOutlineChartBar, HiOutlineTable } from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const Reports = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const handleReportClick = (report) => {
        setSelectedReport(report);
        setIsReportModalOpen(true);
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">System Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Payroll Summary', 'Employee Turnover', 'Performance Analytics'].map((report, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors"
                        onClick={() => handleReportClick(report)}
                    >
                        <div className="h-40 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center text-slate-600">
                            <HiOutlineChartBar className="w-12 h-12 opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{report}</h3>
                        <p className="text-slate-500 text-sm mt-1">Export detailed insights as PDF or CSV.</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleReportClick(report); }}
                            className="mt-4 text-xs font-bold text-primary-500 uppercase tracking-wider hover:text-primary-400 cursor-pointer flex items-center gap-1"
                        >
                            Generate Report &rarr;
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Report Preview Modal */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title={selectedReport || "Report Preview"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-800 border-dashed">
                            <div className="text-center">
                                <HiOutlineChartBar className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Interactive Chart Visualization</p>
                                <p className="text-xs text-slate-600">(Placeholder for Recharts component)</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Total Records</p>
                            <p className="text-xl font-bold text-white mt-1">1,248</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Date Range</p>
                            <p className="text-xl font-bold text-white mt-1">Last 30 Days</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Growth</p>
                            <p className="text-xl font-bold text-emerald-500 mt-1">+12.5%</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => setIsReportModalOpen(false)}
                        >
                            <HiOutlineTable className="w-5 h-5" />
                            View Data Table
                        </button>
                        <button
                            className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => setIsReportModalOpen(false)}
                        >
                            <HiOutlineDocumentDownload className="w-5 h-5" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Reports;
