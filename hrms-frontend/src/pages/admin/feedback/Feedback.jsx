import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlineReply, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlinePaperClip } from 'react-icons/hi';
import { complaintsAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import { getFileUrl } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

const Feedback = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reply, setReply] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => { loadComplaints(); }, []);

    const loadComplaints = async () => {
        try {
            const res = await complaintsAPI.getAll();
            setComplaints(res.data.complaints || []);
        } catch (err) {
            console.error('Load complaints error:', err);
            toast.error('Failed to load complaints');
        } finally { setLoading(false); }
    };

    const handleView = (c) => {
        setSelectedComplaint(c);
        setReply(c.adminReply || '');
        setNewStatus(c.status);
        setShowModal(true);
    };

    const handleReply = async () => {
        if (!selectedComplaint) return;
        setReplying(true);
        try {
            await complaintsAPI.update(selectedComplaint._id, { adminReply: reply, status: newStatus });
            toast.success('Response updated successfully');
            loadComplaints();
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update');
        } finally { setReplying(false); }
    };

    const statusIcon = (status) => {
        if (status === 'Resolved') return <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
        if (status === 'In Progress') return <HiOutlineClock className="w-4 h-4 text-amber-600" />;
        return <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600" />;
    };

    const statusColor = (status) => {
        if (status === 'Resolved') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (status === 'In Progress') return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-rose-700 bg-rose-50 border-rose-100';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Syncing Support Registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Support Requests</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest leading-none mt-0.5">
                            {complaints.length} active tickets • Austere Ops Registry
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50/50 px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Status: Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {complaints.length === 0 ? (
                    <div className="col-span-full text-center py-32 bg-white border-2 border-dashed border-slate-100 rounded-[60px] shadow-sm">
                        <HiOutlineChatAlt2 className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                        <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs italic">Registry Empty: All systems clear</p>
                    </div>
                ) : (
                    complaints.map((c) => (
                        <motion.div
                            key={c._id}
                            whileHover={{ y: -6, scale: 1.01 }}
                            onClick={() => handleView(c)}
                            className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className={cn("p-3.5 rounded-2xl border transition-all duration-500 group-hover:rotate-12", statusColor(c.status))}>
                                        {statusIcon(c.status)}
                                    </div>
                                    <span className={cn("text-[10px] font-black px-5 py-2 rounded-full border uppercase tracking-widest shadow-sm", statusColor(c.status))}>
                                        {c.status}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors uppercase italic">{c.subject}</h4>
                                    <p className="text-xs text-slate-500 font-bold italic mt-3 leading-relaxed line-clamp-2">" {c.message} "</p>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            {c.userId?.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                                                {c.userId?.fullName || 'Anonymous Operator'}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                ID: {c.userId?.employeeId || 'N/A'} • {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:text-emerald-500 transition-colors">
                                        <HiOutlineReply className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Operational Oversight" maxWidth="max-w-xl">
                {selectedComplaint && (
                    <div className="space-y-8 py-2">
                        <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-50">Log Decryption</p>
                            <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase italic">{selectedComplaint.subject}</h4>
                            <div className="mt-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-sm text-slate-600 font-bold italic leading-relaxed">"{selectedComplaint.message}"</p>
                            </div>

                            {selectedComplaint.attachmentUrl && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => window.open(getFileUrl(selectedComplaint.attachmentUrl), '_blank')}
                                        className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all shadow-sm group"
                                    >
                                        <HiOutlinePaperClip className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                                        Analyze Evidence
                                    </button>
                                </div>
                            )}

                            <div className="mt-8 flex items-center gap-4">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Submitted By: <span className="text-emerald-600">{selectedComplaint.userId?.fullName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 opacity-60">Status Modification</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Open', 'In Progress', 'Resolved'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${newStatus === status
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/10'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 opacity-60">Response Transmission</label>
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-6 py-5 text-sm text-slate-700 font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all resize-none shadow-inner placeholder:text-slate-300"
                                    placeholder="Enter registry resolution notes..."
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleReply}
                                disabled={replying}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 shadow-2xl hover:bg-emerald-600 transition-all group"
                            >
                                <HiOutlineReply className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                <span className="uppercase tracking-[0.2em]">{replying ? 'Transmitting...' : 'Authorize & Transmit Response'}</span>
                            </motion.button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default Feedback;
