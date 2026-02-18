import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCheck, HiOutlineSearch, HiOutlineCalendar, HiOutlineFilter } from 'react-icons/hi';
import { reportsAPI } from '../../../services/api';

const DailyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        userId: ''
    });

    useEffect(() => {
        loadReports();
    }, [date]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await reportsAPI.getAll({
                startDate: date,
                endDate: date
            });
            setReports(res.data.reports || []);
        } catch (err) {
            console.error('Load reports error:', err);
        } finally {
            setLoading(false);
        }
    };

    const metrics = [
        { label: 'Total Deliveries', value: reports.reduce((s, r) => s + (r.deliveryCount || 0), 0) },
        { label: 'GTNL Total', value: reports.reduce((s, r) => s + (r.gtnlCount || 0), 0) },
        { label: 'U2S Total', value: reports.reduce((s, r) => s + (r.u2sCount || 0), 0) },
        { label: 'SOPSY Total', value: reports.reduce((s, r) => s + (r.sopsyCount || 0), 0) },
    ];

    return (
        <div className="space-y-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Audit</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">High-precision daily metric tracking for workforce efficiency.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Volume', value: reports.reduce((s, r) => s + (r.deliveryCount || 0), 0), color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'GTNL Metric', value: reports.reduce((s, r) => s + (r.gtnlCount || 0), 0), color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { label: 'U2S Metric', value: reports.reduce((s, r) => s + (r.u2sCount || 0), 0), color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { label: 'SOPSY Metric', value: reports.reduce((s, r) => s + (r.sopsyCount || 0), 0), color: 'text-violet-600 bg-violet-50 border-violet-100' },
                ].map((m, i) => (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={`p-6 rounded-[32px] border ${m.color} shadow-sm group hover:shadow-lg transition-all`}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{m.label}</p>
                        <p className="text-3xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left">{m.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/40">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Information</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">DELIV</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">GTNL</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">U2S</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">SOPSY</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">SR</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">OPERATIONAL HUB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {reports.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all">
                                                    {r.userId?.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight text-sm uppercase">{r.userId?.fullName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {r.userId?.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-slate-900 bg-slate-50/30">{r.deliveryCount}</td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">{r.gtnlCount}</td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">{r.u2sCount}</td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">{r.sopsyCount}</td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">{r.sellerReturnCount}</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200">
                                                {r.userId?.hubName || 'GLOBAL'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-24">
                                            <div className="flex flex-col items-center gap-3">
                                                <HiOutlineClipboardCheck className="w-16 h-16 text-slate-100" />
                                                <p className="text-slate-400 font-bold italic tracking-tight uppercase text-xs">Awaiting data submissions for this lifecycle phase.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyReports;
