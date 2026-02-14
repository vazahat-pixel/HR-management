import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineFilter } from 'react-icons/hi';

const Attendance = () => {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Overview</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor daily check-ins and leave requests.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors">
                        <HiOutlineCalendar className="w-4 h-4" />
                        Date Range
                    </button>
                    <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors">
                        <HiOutlineFilter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stats */}
                {[
                    { label: 'Present Today', value: '1,120', color: 'text-emerald-500' },
                    { label: 'Late Arrivals', value: '45', color: 'text-amber-500' },
                    { label: 'On Leave', value: '28', color: 'text-rose-500' },
                    { label: 'Absent', value: '12', color: 'text-slate-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl"
                    >
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-4">
                    <HiOutlineCalendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-white">No Attendance Records Found</h3>
                <p className="text-slate-500 max-w-sm mt-2">There are no attendance records for the selected date range. Try adjusting the filters.</p>
            </div>
        </div>
    );
};

export default Attendance;
