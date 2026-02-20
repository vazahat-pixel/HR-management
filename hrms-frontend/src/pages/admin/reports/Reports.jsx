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
            toast.error('Failed to load summary reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleFilter = (e) => { e.preventDefault(); loadData(1); };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Fleet Reports</h2>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                        Performance Summary
                    </p>
                </div>
            </div>

            {/* High Level Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total OFD', val: data.summary?.totalOFD },
                    { label: 'Total Delivered', val: data.summary?.totalDEL },
                    { label: 'Pickups', val: data.summary?.totalPICK },
                    { label: 'Success Rate', val: data.summary?.deliverySuccess },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-[#DCDCDC] p-8 rounded-[40px] shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#F9EBE0] opacity-50" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{stat.label}</span>
                        <span className={`text-3xl font-black mt-3 relative z-10 tracking-tighter ${i === 1 ? 'text-[#C46A2D]' : 'text-slate-900'}`}>{stat.val || 0}</span>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-[#DCDCDC]/60 rounded-[32px] p-6 shadow-sm flex flex-wrap items-center gap-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-6 flex-1">
                    <div className="flex items-center gap-4 bg-[#F5F5F5] px-6 py-3 rounded-2xl border border-[#DCDCDC]/40 shadow-inner">
                        <HiOutlineCalendar className="text-[#C46A2D] w-4 h-4" />
                        <input
                            type="date"
                            value={filters.date}
                            onChange={e => setFilters({ ...filters, date: e.target.value })}
                            className="bg-transparent text-[11px] font-black text-slate-900 uppercase tracking-tight outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-[#F5F5F5] px-6 py-3 rounded-2xl border border-[#DCDCDC]/40 shadow-inner min-w-[240px]">
                        <HiOutlineLocationMarker className="text-[#C46A2D] w-4 h-4" />
                        <input
                            type="text"
                            placeholder="FILTER BY HUB..."
                            value={filters.hub}
                            onChange={e => setFilters({ ...filters, hub: e.target.value })}
                            className="bg-transparent text-[11px] font-black text-slate-900 uppercase tracking-tight outline-none placeholder:text-slate-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-slate-900 text-white px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#C46A2D] transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                        <HiOutlineFilter className="w-4 h-4" /> Apply Filters
                    </button>
                </form>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-[#DCDCDC]/60 rounded-[40px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F5F5F5] border-b border-[#DCDCDC]/60">
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee/EHRID</th>
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hub Assignment</th>
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">OFD</th>
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Delivered</th>
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Picked</th>
                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Success Velocity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCDCDC]/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="w-10 h-10 border-[3px] border-[#F5F5F5] border-t-[#C46A2D] rounded-full animate-spin mx-auto opacity-70" />
                                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Node Summary...</p>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {data.reports.map((report) => (
                                        <tr key={report._id} className="hover:bg-[#F5F5F5]/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight uppercase group-hover:text-[#C46A2D] transition-colors">{report.employeeId?.fullName}</span>
                                                    <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter uppercase mt-1">ID: {report.ehrId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[9px] font-black text-slate-500 uppercase bg-[#F5F5F5] px-4 py-1.5 rounded-full border border-[#DCDCDC]/40 group-hover:bg-white transition-all">{report.hubName}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center text-[13px] font-bold text-slate-600">{report.ofd}</td>
                                            <td className="px-8 py-6 text-center text-sm font-black text-[#3F7D58]">{report.delivered}</td>
                                            <td className="px-8 py-6 text-center text-sm font-bold text-slate-800">{report.picked}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className="text-[11px] font-black text-slate-900">{(report.delivered / (report.ofd || 1) * 100).toFixed(1)}%</span>
                                                    <div className="w-16 bg-[#F5F5F5] h-1.5 rounded-full overflow-hidden border border-[#DCDCDC]/40 shadow-inner">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#C46A2D] to-[#A55522] shadow-[0_0_8px_rgba(196,106,45,0.4)]"
                                                            style={{ width: `${(report.delivered / (report.ofd || 1) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.reports.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-32 text-center text-[10px] font-black text-slate-300 italic uppercase tracking-[0.3em]">
                                                Null telemetry matches for current vector.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {data.pagination?.pages > 1 && (
                <div className="flex justify-center items-center gap-6 py-10">
                    <button
                        onClick={() => loadData(data.pagination.page - 1)}
                        disabled={data.pagination.page === 1}
                        className="bg-white border border-[#DCDCDC] px-6 py-2.5 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#C46A2D] hover:border-[#F9EBE0] disabled:opacity-20 transition-all flex items-center gap-2"
                    >
                        ← PREV CYCLE
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] bg-[#F5F5F5] px-6 py-2.5 rounded-2xl border border-[#DCDCDC]/40">
                        NODE {data.pagination.page} <span className="text-[#C46A2D]/40 mx-2">/</span> {data.pagination.pages}
                    </span>
                    <button
                        onClick={() => loadData(data.pagination.page + 1)}
                        disabled={data.pagination.page === data.pagination.pages}
                        className="bg-white border border-[#DCDCDC] px-6 py-2.5 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#C46A2D] hover:border-[#F9EBE0] disabled:opacity-20 transition-all flex items-center gap-2"
                    >
                        NEXT CYCLE →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportsSummary;
