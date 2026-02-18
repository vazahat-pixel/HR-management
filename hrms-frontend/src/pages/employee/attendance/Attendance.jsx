import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineFingerPrint,
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import { cn } from '../../../lib/utils';
import Modal from '../../../components/common/Modal';

const attendanceData = [
    { date: 'Feb 12, Thu', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present', color: 'text-emerald-500' },
    { date: 'Feb 11, Wed', checkIn: '08:55 AM', checkOut: '05:45 PM', status: 'Present', color: 'text-emerald-500' },
    { date: 'Feb 10, Tue', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present', color: 'text-emerald-500' },
    { date: 'Feb 09, Mon', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', color: 'text-emerald-500' },
    { date: 'Feb 08, Sun', checkIn: '-', checkOut: '-', status: 'Weekend', color: 'text-zinc-500' },
];

const Attendance = () => {
    // ... existing state ...
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    // ... rest of state ...

    return (
        <div className="space-y-10 max-w-xl mx-auto pb-24">
            {/* Real-time Chrono Section */}
            <div className="text-center py-6">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black text-slate-900 tracking-tighter leading-none"
                >
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </motion.h1>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Attendance Matrix Gateway */}
            <div className="relative flex flex-col items-center py-8">
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className={cn(
                        "w-56 h-56 rounded-full blur-[64px] opacity-20 animate-pulse transition-all duration-700",
                        isCheckedIn ? "bg-emerald-500" : "bg-indigo-500"
                    )} />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleAttendance}
                    className={cn(
                        "w-44 h-44 rounded-[56px] flex flex-col items-center justify-center gap-3 transition-all duration-500 border-8 relative z-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] cursor-pointer group",
                        isCheckedIn
                            ? "bg-white border-white text-rose-500 shadow-rose-500/20"
                            : "bg-slate-900 border-slate-800 text-white shadow-indigo-500/20"
                    )}
                >
                    <HiOutlineFingerPrint className={cn("w-12 h-12 transition-transform duration-500", isCheckedIn ? "rotate-180" : "rotate-0")} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                        {isCheckedIn ? 'Terminate Shift' : 'Initiate Shift'}
                    </span>

                    {/* Ring effect */}
                    <div className={cn(
                        "absolute inset-[-12px] border-2 rounded-[64px] opacity-20 group-hover:inset-[-20px] group-hover:opacity-40 transition-all duration-500",
                        isCheckedIn ? "border-rose-500" : "border-indigo-500"
                    )} />
                </motion.button>

                {/* Status Matrix */}
                <div className="mt-14 text-center space-y-4">
                    <div className={cn(
                        "inline-flex items-center gap-3 px-6 py-2.5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl transition-all",
                        isCheckedIn
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5"
                            : "bg-white text-slate-400 border-slate-100 shadow-slate-900/5"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full", isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                        Session: {isCheckedIn ? 'ACTIVE NODAL LINK' : 'OFFLINE'}
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2 font-black uppercase tracking-widest">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5 text-indigo-500" />
                        Authenticated Office Node
                    </p>
                </div>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-2 gap-6">
                {[
                    { label: 'Avg Ingress', val: '09:04', unit: 'AM', icon: HiOutlineClock, color: 'indigo' },
                    { label: 'Leave Quota', val: '14', unit: 'Units', icon: HiOutlineCalendar, color: 'teal' }
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all cursor-pointer group"
                        onClick={() => setIsStatsModalOpen(true)}
                    >
                        <div className={`w-8 h-8 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        <div className="flex items-end gap-2 mt-2">
                            <h4 className="text-2xl font-black text-slate-900 leading-none">{stat.val}</h4>
                            <span className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* History Ledger */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Historical Ledger</h2>
                    <button
                        onClick={() => { }}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline active:scale-95 transition-all"
                    >
                        Archive
                    </button>
                </div>
                <div className="space-y-3">
                    {attendanceData.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:shadow-xl hover:shadow-slate-200/50 hover:bg-slate-50/50 transition-all cursor-pointer group"
                            onClick={() => handleLogClick(log)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                    <HiOutlineCalendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 tracking-tight">{log.date}</h5>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">{log.checkIn} - {log.checkOut}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border shadow-sm",
                                log.status === 'Present' ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-200"
                            )}>
                                {log.status}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Log Details Modal */}
            <Modal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                title="Attendance Details"
            >
                {selectedLog && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entry Date</p>
                                <h3 className="text-xl font-black text-slate-900">{selectedLog.date}</h3>
                            </div>
                            <div className={cn("px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                selectedLog.status === 'Present' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                                {selectedLog.status}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check In</p>
                                <p className="text-2xl font-black text-slate-900">{selectedLog.checkIn}</p>
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">On Time</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check Out</p>
                                <p className="text-2xl font-black text-slate-900">{selectedLog.checkOut}</p>
                                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[9px] font-bold">Standard Shift</div>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-600 rounded-2xl text-xs text-white font-bold text-center shadow-lg shadow-emerald-500/20">
                            Verified Working Duration: <span className="text-white text-sm ml-1 font-black">9h 10m</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Stats Modal */}
            <Modal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                title="Attendance Statistics"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Present Days</p>
                            <h3 className="text-3xl font-black text-emerald-600 mt-2">22</h3>
                        </div>
                        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] text-rose-700 font-black uppercase tracking-widest">Absences</p>
                            <h3 className="text-3xl font-black text-rose-600 mt-2">2</h3>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Leave Balance Breakdown</h4>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 shadow-inner">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-bold italic">Sick Leave Used</span>
                                <span className="text-slate-900 font-black px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">1 Day</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-bold italic">Casual Leave Used</span>
                                <span className="text-slate-900 font-black px-3 py-1 bg-white rounded-xl shadow-sm border border-slate-100">1 Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Attendance;
