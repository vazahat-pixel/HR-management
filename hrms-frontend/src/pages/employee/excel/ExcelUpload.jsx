import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload } from 'react-icons/hi';

const ExcelUpload = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <motion.div
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-lg p-16 border-2 border-dashed border-slate-200 rounded-[48px] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] hover:bg-slate-50/50 hover:border-emerald-200 transition-all cursor-pointer flex flex-col items-center text-center group"
                onClick={() => alert("Dummy Action: Open Terminal for XLS Stream Injector")}
            >
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-8 border border-slate-100 shadow-inner group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500">
                    <HiOutlineCloudUpload className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">Registry Transmission</h3>
                <p className="text-slate-500 text-sm mb-10 font-medium italic leading-relaxed">Secure data relay for bulk operational records. <br />Accepted protocols: .XLS, .XLSX, .CSV</p>
                <button
                    onClick={(e) => { e.stopPropagation(); alert("Dummy Action: Initiating File Stream..."); }}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 cursor-pointer"
                >
                    Link Source Data
                </button>
            </motion.div>
        </div>
    );
};

export default ExcelUpload;
