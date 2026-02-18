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
        <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Oversight</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Real-time monitoring of workforce clock-ins and mobility.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDateRange}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <HiOutlineCalendar className="w-5 h-5 text-emerald-500" />
                        Date
                    </button>
                    <button
                        onClick={handleFilter}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <HiOutlineFilter className="w-5 h-5 text-emerald-500" />
                        Filters
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <HiOutlineDownload className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Stats */}
                {[
                    { label: 'Present Today', value: '1,120', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'Late Arrivals', value: '45', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { label: 'On Leave', value: '28', color: 'text-rose-600 bg-rose-50 border-rose-100' },
                    { label: 'Out of Office', value: '12', color: 'text-slate-600 bg-slate-50 border-slate-100' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-2xl border ${stat.color} shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                        onClick={() => alert(`Dummy Action: View details for ${stat.label}`)}
                    >
                        <p className="text-[10px] uppercase tracking-widest font-black opacity-70 group-hover:opacity-100 transition-opacity">{stat.label}</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-[30px] overflow-hidden shadow-xl shadow-slate-200/40">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5">Employee</th>
                            <th className="px-8 py-5">Check In</th>
                            <th className="px-8 py-5">Check Out</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Worksite</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {attendanceRecords.map((record, i) => (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleViewLog(record)}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20">
                                            {record.name.charAt(0)}
                                        </div>
                                        <span className="text-slate-900 text-sm font-bold group-hover:text-emerald-700 transition-colors">{record.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-slate-500 text-sm font-medium">{record.checkIn}</td>
                                <td className="px-8 py-5 text-slate-500 text-sm font-medium">{record.checkOut}</td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-500 text-sm font-medium">{record.location}</td>
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
                        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20">
                                    {selectedLog.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedLog.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Reference ID: #{selectedLog.id}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black border uppercase tracking-widest shadow-sm ${selectedLog.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {selectedLog.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check In Time</p>
                                <p className="text-2xl font-black text-slate-900">{selectedLog.checkIn}</p>
                                <p className="text-[9px] font-bold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Gate 1 • Facial ID</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check Out Time</p>
                                <p className="text-2xl font-black text-slate-900">{selectedLog.checkOut}</p>
                                <p className="text-[9px] font-bold text-slate-500 mt-2 bg-slate-100 px-2 py-0.5 rounded-full inline-block">Gate 2 • QR Scan</p>
                            </div>
                        </div>

                        <div className="h-44 bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center flex-col gap-3 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                            <HiOutlineLocationMarker className="w-10 h-10 text-emerald-600 relative z-10" />
                            <div className="text-center relative z-10">
                                <p className="text-sm text-slate-900 font-black tracking-tight">Geo-Location Verified</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">LAT: 22.7196° N, LON: 75.8577° E</p>
                            </div>
                            <button className="mt-2 text-[10px] font-black text-emerald-700 bg-white px-4 py-1.5 rounded-xl border border-emerald-100 shadow-sm relative z-10 hover:shadow-md hover:bg-emerald-50 transition-all">
                                View Map Records
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Attendance;
