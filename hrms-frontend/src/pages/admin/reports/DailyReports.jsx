import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCheck, HiOutlineSearch, HiOutlineCalendar, HiOutlineFilter, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { dailyReportsAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

const DailyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [uploading, setUploading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState(null);

    useEffect(() => {
        loadReports();
    }, [date]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await dailyReportsAPI.getSummary({ date });
            setReports(res.data.reports || []);
        } catch (err) {
            console.error('Load reports error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportDate', date);

        setUploading(true);
        setUploadSummary(null);
        try {
            const res = await dailyReportsAPI.upload(formData);
            setUploadSummary(res.data.summary);
            toast.success('File processed successfully!');
            loadReports();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Daily Reports</h1>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                        Bulk Performance Synchronization
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <label className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-sm ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-[#C46A2D] text-white hover:bg-black hover:shadow-lg'}`}>
                            <HiOutlineUpload className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
                            {uploading ? 'Processing...' : 'Bulk Upload'}
                            <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" accept=".xlsx" />
                        </label>
                    </div>
                    <div className="relative group">
                        <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C46A2D] w-5 h-5 group-hover:scale-110 transition-transform" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-[#DCDCDC] rounded-2xl pl-12 pr-6 py-3 text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none focus:border-[#C46A2D] transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Upload Summary Card */}
            {uploadSummary && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#DCDCDC] p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-l-[#C46A2D]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F9EBE0] rounded-2xl flex items-center justify-center text-[#C46A2D]">
                            <HiOutlineCheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[14px] font-black text-slate-900 uppercase">Process Completed</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Total: {uploadSummary.total} | Success: {uploadSummary.success} | Failed: {uploadSummary.failed}</p>
                        </div>
                    </div>
                    {uploadSummary.skippedFhrids.length > 0 && (
                        <div className="w-full md:w-auto max-w-sm">
                            <p className="text-[9px] font-black text-[#A55522] uppercase tracking-widest mb-1.5">Skipped FHRIDs (Not in Database)</p>
                            <div className="text-[10px] bg-[#F5F5F5] p-3 rounded-xl border border-[#DCDCDC]/60 text-slate-500 font-bold overflow-x-auto whitespace-nowrap scrollbar-hide">
                                {uploadSummary.skippedFhrids.join(', ')}
                            </div>
                        </div>
                    )}
                    <button onClick={() => setUploadSummary(null)} className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest">Dismiss</button>
                </motion.div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Out for Delivery', value: reports.reduce((s, r) => s + (r.ofd || 0), 0) },
                    { label: 'DELIVERED', value: reports.reduce((s, r) => s + (r.delivered || 0), 0) },
                    { label: 'Out for Pickup', value: reports.reduce((s, r) => s + (r.ofp || 0), 0) },
                    { label: 'PICKED', value: reports.reduce((s, r) => s + (r.picked || 0), 0) },
                ].map((m, i) => (
                    <div key={i} className="bg-white border border-[#DCDCDC] p-7 rounded-[32px] shadow-sm group hover:shadow-md transition-all">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{m.label}</p>
                        <p className={`text-[32px] font-black tracking-tighter transition-transform origin-left ${m.label === 'DELIVERED' ? 'text-emerald-600' : 'text-slate-900'}`}>{m.value}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white border border-[#DCDCDC]/60 rounded-[40px] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-24 text-center">
                        <div className="w-10 h-10 border-[3px] border-[#F5F5F5] border-t-[#C46A2D] rounded-full animate-spin mx-auto" />
                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Reports...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F5F5F5] border-b border-[#DCDCDC]/60">
                                    <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">FHRID & Employee</th>
                                    <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">OFD</th>
                                    <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-emerald-600">DELIVERED</th>
                                    <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-blue-600">OFP</th>
                                    <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">PICKED</th>
                                    <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Hub Name</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCDCDC]/40">
                                {reports.map((r) => (
                                    <tr key={r._id} className="hover:bg-[#F5F5F5]/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#C46A2D] text-xs font-black border border-[#DCDCDC]/40 group-hover:bg-[#F9EBE0] transition-all">
                                                    {r.fhrid?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight text-sm uppercase group-hover:text-[#C46A2D] transition-colors">{r.full_name || 'N/A'}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">FHRID: {r.fhrid}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center font-black text-slate-900 text-sm group-hover:bg-[#F5F5F5]/50 transition-colors uppercase">{r.ofd}</td>
                                        <td className="px-6 py-6 text-center font-black text-emerald-600 text-sm bg-emerald-50/30 group-hover:bg-emerald-50/50 transition-colors">{r.delivered}</td>
                                        <td className="px-6 py-6 text-center font-black text-blue-600 text-sm bg-blue-50/30 group-hover:bg-blue-50/50 transition-colors">{r.ofp}</td>
                                        <td className="px-6 py-6 text-center font-black text-slate-900 text-sm group-hover:bg-[#F5F5F5]/50 transition-colors">{r.picked}</td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="px-4 py-1.5 bg-[#F5F5F5] text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-[#DCDCDC]/40 group-hover:bg-white group-hover:text-[#C46A2D] transition-all">
                                                {r.hub_name || 'INTERNAL'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-4">
                                                <HiOutlineClipboardCheck className="w-20 h-20 text-slate-100" />
                                                <p className="text-slate-300 font-black italic tracking-[0.3em] uppercase text-xs">Waiting for Excel Synchronization</p>
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
