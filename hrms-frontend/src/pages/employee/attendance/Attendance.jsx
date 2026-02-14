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
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleAttendance = () => {
        const isCheckingIn = !isCheckedIn;
        setIsCheckedIn(isCheckingIn);
        // Dummy Alert - replaced with a toast or just state change for now as it is a main action
        // For this task, we focus on Modals for details. 
        // We can add a confirmation modal if needed, but the button toggle is usually direct.
        // Let's stick to the direct toggle for now as it is a primary action.
    };

    const handleLogClick = (log) => {
        setSelectedLog(log);
        setIsLogModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-20">
            {/* Real-time Clock Section */}
            <div className="text-center py-2">
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
            </div>

            {/* Attendance Action */}
            <div className="relative flex flex-col items-center">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAttendance}
                    className={cn(
                        "w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 border-4 relative z-10 shadow-xl cursor-pointer",
                        isCheckedIn
                            ? "bg-zinc-900 border-red-500/50 text-red-500 shadow-red-900/10"
                            : "bg-zinc-100 border-zinc-200 text-black shadow-zinc-200/20"
                    )}
                >
                    <HiOutlineFingerPrint className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isCheckedIn ? 'Check Out' : 'Check In'}
                    </span>
                </motion.button>

                {/* Status Indicator */}
                <div className="mt-6 text-center space-y-1">
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        isCheckedIn
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-zinc-500")} />
                        {isCheckedIn ? 'Online' : 'Offline'}
                    </div>
                    <p className="text-[10px] text-zinc-500 flex items-center justify-center gap-1 mt-2">
                        <HiOutlineLocationMarker className="w-3 h-3" />
                        Indore Office
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setIsStatsModalOpen(true)}>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Avg Arrival</p>
                    <div className="flex items-end gap-2 mt-1">
                        <h4 className="text-xl font-bold text-zinc-100">09:04</h4>
                        <span className="text-[10px] font-bold text-zinc-600 mb-1">AM</span>
                    </div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setIsStatsModalOpen(true)}>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Leave Balance</p>
                    <div className="flex items-end gap-2 mt-1">
                        <h4 className="text-xl font-bold text-zinc-100">14</h4>
                        <span className="text-[10px] font-bold text-zinc-600 mb-1">Days</span>
                    </div>
                </div>
            </div>

            {/* Logs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Recent Logs</h2>
                    <button
                        onClick={() => alert("Dummy Action: View All Attendance Logs")}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-2">
                    {attendanceData.map((log, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
                            onClick={() => handleLogClick(log)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700/50">
                                    <HiOutlineCalendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-zinc-200">{log.date}</h5>
                                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{log.checkIn} - {log.checkOut}</p>
                                </div>
                            </div>
                            <span className={cn("text-[10px] font-bold", log.status === 'Present' ? "text-emerald-500" : "text-zinc-500")}>
                                {log.status}
                            </span>
                        </div>
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Date</p>
                                <h3 className="text-lg font-bold text-white">{selectedLog.date}</h3>
                            </div>
                            <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                selectedLog.status === 'Present' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            )}>
                                {selectedLog.status}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Check In</p>
                                <p className="text-xl font-bold text-white">{selectedLog.checkIn}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">On Time</p>
                            </div>
                            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Check Out</p>
                                <p className="text-xl font-bold text-white">{selectedLog.checkOut}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">Regular Shift</p>
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-400 leading-relaxed text-center">
                            Total working hours: <span className="text-white font-bold">9h 10m</span>
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
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                            <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Present Days</p>
                            <h3 className="text-2xl font-bold text-white mt-1">22</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Absences</p>
                            <h3 className="text-2xl font-bold text-white mt-1">2</h3>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Leave Deductions</h4>
                        <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Sick Leave</span>
                                <span className="text-white font-bold">1 Day</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Casual Leave</span>
                                <span className="text-white font-bold">1 Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Attendance;
