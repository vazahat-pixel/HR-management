import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCheck, HiOutlinePaperAirplane, HiOutlineCalendar } from 'react-icons/hi';
import { reportsAPI } from '../../../services/api';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        deliveryCount: '',
        gtnlCount: '',
        u2sCount: '',
        sopsyCount: '',
        sellerReturnCount: '',
        hoursWorked: '',
        notes: '',
    });

    useEffect(() => { loadReports(); }, []);

    const loadReports = async () => {
        try {
            const res = await reportsAPI.getAll({ limit: 30 });
            setReports(res.data.reports || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMsg('');
        try {
            await reportsAPI.submit({
                ...form,
                deliveryCount: Number(form.deliveryCount) || 0,
                gtnlCount: Number(form.gtnlCount) || 0,
                u2sCount: Number(form.u2sCount) || 0,
                sopsyCount: Number(form.sopsyCount) || 0,
                sellerReturnCount: Number(form.sellerReturnCount) || 0,
                hoursWorked: Number(form.hoursWorked) || 0,
            });
            setSuccessMsg('Report submitted!');
            loadReports();
        } catch (err) {
            setError(err.response?.data?.error || 'Submit failed');
        } finally { setSubmitting(false); }
    };

    const [error, setError] = useState('');

    const inputCls = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-zinc-600";

    return (
        <div className="space-y-10 max-w-2xl mx-auto pb-32 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100/50">
                    <HiOutlineClipboardCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Productivity Log</h1>
                <p className="text-slate-500 mt-3 font-medium flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Synchronizing daily operational metrics
                </p>
            </div>

            {/* Submit Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-[40px] p-10 space-y-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Reporting Period</label>
                    <div className="relative group">
                        <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm text-slate-900 font-extrabold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {[
                        { key: 'deliveryCount', label: 'TOTAL DELIVERIES', color: 'emerald' },
                        { key: 'gtnlCount', label: 'GTNL METRIC', color: 'indigo' },
                        { key: 'u2sCount', label: 'U2S METRIC', color: 'rose' },
                        { key: 'sopsyCount', label: 'SOPSY METRIC', color: 'amber' },
                        { key: 'sellerReturnCount', label: 'SELLER RETURN', color: 'slate' },
                        { key: 'hoursWorked', label: 'HOURS DEPLOYED', color: 'emerald' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{f.label}</label>
                            <input
                                type="number"
                                min="0"
                                value={form[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-900 font-extrabold outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-200"
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Deployment Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-900 font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-300"
                        placeholder="Log any anomalies or achievements..."
                    />
                </div>

                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] font-black text-emerald-600 text-center bg-emerald-50 py-3 rounded-xl border border-emerald-100 uppercase tracking-widest"
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.01, translateY: -2 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all"
                >
                    <HiOutlinePaperAirplane className="w-5 h-5 text-emerald-400" />
                    {submitting ? 'Transmitting...' : 'Dispatch Daily Report'}
                </motion.button>

                {error && <p className="text-[10px] font-black text-rose-500 text-center mt-4 uppercase tracking-widest">{error}</p>}
            </motion.form>

            {/* History */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Archives</h3>
                    <div className="h-px bg-slate-100 w-full" />
                </div>

                {reports.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 border-dashed rounded-[32px] py-12 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] italic">No historical data found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((r, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={r._id || i}
                                className="bg-white border border-slate-200 rounded-[24px] p-6 flex items-center justify-between hover:shadow-xl hover:shadow-slate-100 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                        <HiOutlineCalendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{new Date(r.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">{r.deliveryCount} DELIVERIES</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{r.hoursWorked} POWER HOURS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GTNL: {r.gtnlCount}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">U2S: {r.u2sCount}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Reports;
