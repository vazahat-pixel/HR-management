import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineCash, HiOutlineDocumentText } from 'react-icons/hi';
import { dailyReportsAPI, payrollAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const MyPerformance = () => {
    const [reports, setReports] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payoutLoading, setPayoutLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    const loadReports = async (page = 1) => {
        setLoading(true);
        try {
            const res = await dailyReportsAPI.getEmployeeReports({ ...filters, page, limit: 10 });
            setReports(res.data.reports || []);
            setPagination(res.data.pagination || { page: 1, total: 0, pages: 1 });
        } catch (err) {
            toast.error('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const loadPayouts = async () => {
        setPayoutLoading(true);
        try {
            const res = await payrollAPI.getEmployeePayouts();
            setPayouts(res.data.payouts || []);
        } catch (err) {
            console.error('Payout fetch error:', err);
        } finally {
            setPayoutLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
        loadPayouts();
    }, []);

    const handleFilter = (e) => { e.preventDefault(); loadReports(1); };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="space-y-12 pb-32 max-w-5xl mx-auto">
            {/* DAILY REPORTS SECTION */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Performance</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Operational Telemetry
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'OFD', val: reports.reduce((s, r) => s + (r.ofd || 0), 0), icon: HiOutlineChartBar, gradient: 'from-emerald-500 to-teal-600' },
                        { label: 'DELIVERED', val: reports.reduce((s, r) => s + (r.delivered || 0), 0), icon: HiOutlineCheckCircle, gradient: 'from-blue-500 to-indigo-600' },
                        { label: 'PICKED', val: reports.reduce((s, r) => s + (r.picked || 0), 0), icon: HiOutlineTrendingUp, gradient: 'from-indigo-500 to-purple-600' },
                        { label: 'EFFICIENCY', val: reports.length > 0 ? (reports.reduce((s, r) => s + (r.delivered || 0), 0) / reports.reduce((s, r) => s + (r.ofd || 1), 0) * 100).toFixed(1) + '%' : '0%', icon: HiOutlineTrendingUp, gradient: 'from-amber-500 to-orange-600' }
                    ].map((stat, i) => (
                        <motion.div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${stat.gradient} text-white shadow-md transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <span className="text-2xl font-black text-slate-900 mt-1">{stat.val}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-200 rounded-[32px] p-4 shadow-sm">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                            <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                            <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500" />
                        </div>
                        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                            Query Logs
                        </button>
                    </form>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div></div>
                    ) : (
                        <>
                            {reports.map((report, idx) => (
                                <motion.div key={report._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-slate-200 rounded-[28px] p-5 flex items-center justify-between shadow-sm group hover:border-emerald-200 transition-all hover:bg-emerald-50/10 cursor-default"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">{new Date(report.reportDate).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-xl font-black text-slate-900 leading-none mt-0.5">{new Date(report.reportDate).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{new Date(report.reportDate).toLocaleDateString(undefined, { weekday: 'long' })}</h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 uppercase">{report.hub_name}</span>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Efficiency: {(report.delivered / (report.ofd || 1) * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OFD</p>
                                            <p className="text-sm font-black text-slate-900">{report.ofd}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Delivered</p>
                                            <p className="text-sm font-black text-emerald-700">{report.delivered}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Picked</p>
                                            <p className="text-sm font-black text-blue-900">{report.picked}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {reports.length === 0 && (
                                <div className="py-16 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                                    <HiOutlineChartBar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Waiting for Daily Synchronization</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button key={i} onClick={() => loadReports(i + 1)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.page === i + 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* MONTHLY PAYOUT SECTION */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Monthly Payout</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#C46A2D] rounded-full" /> Verified Disbursement Summary
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    {payoutLoading ? (
                        <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-[#C46A2D] border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        {['Period', 'Amount', 'Working Days', 'Operational Volume', 'Status'].map(h => (
                                            <th key={h} className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-8 py-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payouts.map((p, idx) => (
                                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-black text-slate-900 uppercase">
                                                    {monthNames[p.month - 1]} {p.year}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-black text-emerald-600">₹{p.totalPayAmount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-slate-600">{p.workingDays} Days</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">DEL</p>
                                                        <p className="text-[10px] font-black text-slate-700">{p.deliveredCount}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">PICK</p>
                                                        <p className="text-[10px] font-black text-slate-700">{p.pickedCount}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                                                    Disbursed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {payouts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Payout Record Found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPerformance;
