import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlineDownload, HiOutlineLocationMarker } from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const Attendance = () => {
    const attendanceRecords = [
        { id: 101, name: 'Alex Morgan', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', location: 'Office' },
        { id: 102, name: 'Sarah Connor', checkIn: '09:15 AM', checkOut: '06:15 PM', status: 'Late', location: 'Remote' },
        { id: 103, name: 'John Doe', checkIn: '-', checkOut: '-', status: 'Absent', location: '-' },
        { id: 104, name: 'Jane Smith', checkIn: '08:55 AM', checkOut: '05:55 PM', status: 'Present', location: 'Office' },
        { id: 105, name: 'Mike Johnson', checkIn: '09:05 AM', checkOut: '06:05 PM', status: 'Present', location: 'Site A' },
    ];

    const handleDateRange = () => {
        alert("Dummy Action: Open Date Range Picker");
    };

    const handleFilter = () => {
        alert("Dummy Action: Open Filter Options\n- By Status\n- By Department\n- By Location");
    };

    const handleExport = () => {
        alert("Dummy Action: Export Attendance Report");
    };

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const handleViewLog = (record) => {
        setSelectedLog(record);
        setIsLogModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Overview</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor daily check-ins and leave requests.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDateRange}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <HiOutlineCalendar className="w-4 h-4" />
                        Date Range
                    </button>
                    <button
                        onClick={handleFilter}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <HiOutlineFilter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <HiOutlineDownload className="w-4 h-4" />
                        Export
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
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
                        onClick={() => alert(`Dummy Action: View details for ${stat.label}`)}
                    >
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</p>
                        <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Check In</th>
                            <th className="px-6 py-4 font-semibold">Check Out</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {attendanceRecords.map((record, i) => (
                            <tr key={record.id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => handleViewLog(record)}>
                                <td className="px-6 py-4">
                                    <span className="text-white text-sm font-medium">{record.name}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{record.checkIn}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{record.checkOut}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' :
                                        record.status === 'Late' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{record.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Log Modal */}
            <Modal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                title="Attendance Log Details"
            >
                {selectedLog && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedLog.name}</h3>
                                <p className="text-sm text-slate-400">ID: #{selectedLog.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedLog.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {selectedLog.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Check In</p>
                                <p className="text-xl font-bold text-white">{selectedLog.checkIn}</p>
                                <p className="text-[10px] text-slate-500 mt-1">Via Biometric Device A</p>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Check Out</p>
                                <p className="text-xl font-bold text-white">{selectedLog.checkOut}</p>
                                <p className="text-[10px] text-slate-500 mt-1">Via Mobile App</p>
                            </div>
                        </div>

                        <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center flex-col gap-2">
                            <HiOutlineLocationMarker className="w-8 h-8 text-slate-600" />
                            <p className="text-sm text-slate-400 font-medium">Location Map Placeholder</p>
                            <p className="text-xs text-slate-500">Coordinates: 12.9716° N, 77.5946° E</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Attendance;
