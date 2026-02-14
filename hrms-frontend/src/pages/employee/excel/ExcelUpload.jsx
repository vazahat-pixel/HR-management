import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload } from 'react-icons/hi';

const ExcelUpload = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-300">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full max-w-md p-10 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-900/50 hover:bg-slate-900 hover:border-primary-500/50 transition-all cursor-pointer flex flex-col items-center text-center group"
                onClick={() => alert("Dummy Action: Open File Picker")}
            >
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6 group-hover:text-primary-500 group-hover:bg-primary-500/20 transition-all">
                    <HiOutlineCloudUpload className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Excel Sheet</h3>
                <p className="text-slate-500 text-sm mb-6">Drag & drop your timesheet or expense report here. Allowed formats: .xls, .xlsx</p>
                <button
                    onClick={(e) => { e.stopPropagation(); alert("Dummy Action: Open File Picker"); }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 cursor-pointer"
                >
                    Browse Files
                </button>
            </motion.div>
        </div>
    );
};

export default ExcelUpload;
