import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineFilter, HiOutlineDownload, HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineLocationMarker } from 'react-icons/hi';
import { dailyReportsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const ReportsSummary = () => {
    const [data, setData] = useState({ reports: [], summary: {}, pagination: {} });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0], hub: '' });

    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await dailyReportsAPI.getSummary({ ...filters, page });
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load summary telemetry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleFilter = (e) => { e.preventDefault(); loadData(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fleet Operations Analytics</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Global Performance Matrix</p>
                </div>
            </div>

            {/* High Level Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total OFD', val: data.summary?.totalOFD, color: 'emerald' },
                    { label: 'Total Delivered', val: data.summary?.totalDEL, color: 'blue' },
                    { label: 'Fleet Pickups', val: data.summary?.totalPICK, color: 'indigo' },
                    { label: 'Success Velocity', val: data.summary?.deliverySuccess, color: 'amber' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm flex flex-col items-center text-center relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 inset-x-0 h-1.5 bg-${stat.color}-500/30 group-hover:h-full transition-all duration-500 opacity-20`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{stat.label}</span>
                        <span className="text-3xl font-black text-slate-900 mt-2 relative z-10">{stat.val || 0}</span>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-wrap items-center gap-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-6 flex-1">
                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                        <HiOutlineCalendar className="text-slate-400 w-4 h-4" />
                        <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="bg-transparent text-xs font-black text-slate-700 outline-none" />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                        <HiOutlineLocationMarker className="text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="Filter by Hub..." value={filters.hub} onChange={e => setFilters({ ...filters, hub: e.target.value })} className="bg-transparent text-xs font-black text-slate-700 outline-none placeholder:text-slate-300" />
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                        <HiOutlineFilter className="w-3.5 h-3.5" /> Apply Filters
                    </button>
                </form>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee/EHRID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hub Assignment</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OFD</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Delivered</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Picked</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Success %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center"><div className="loading-spinner h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div></td></tr>
                            ) : (
                                <>
                                    {data.reports.map((report) => (
                                        <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight">{report.employeeId?.fullName}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 font-mono tracking-tighter uppercase">{report.ehrId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">{report.hubName}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center text-sm font-bold text-slate-600">{report.ofd}</td>
                                            <td className="px-8 py-5 text-center text-sm font-black text-emerald-600">{report.delivered}</td>
                                            <td className="px-8 py-5 text-center text-sm font-bold text-blue-600">{report.picked}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-black text-slate-900">{(report.delivered / (report.ofd || 1) * 100).toFixed(1)}%</span>
                                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${(report.delivered / (report.ofd || 1) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.reports.length === 0 && (
                                        <tr><td colSpan={6} className="py-20 text-center text-sm font-bold text-slate-400 italic">No operational data matches these parameters.</td></tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {data.pagination?.pages > 1 && (
                <div className="flex justify-center items-center gap-4 py-8">
                    <button onClick={() => loadData(data.pagination.page - 1)} disabled={data.pagination.page === 1} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all">← Prev</button>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nexus Hub {data.pagination.page} / {data.pagination.pages}</span>
                    <button onClick={() => loadData(data.pagination.page + 1)} disabled={data.pagination.page === data.pagination.pages} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all">Next →</button>
                </div>
            )}
        </div>
    );
};

export default ReportsSummary;
