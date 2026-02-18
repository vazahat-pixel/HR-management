import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlineCheckCircle, HiOutlineClock, HiOutlineUpload, HiOutlinePaperClip } from 'react-icons/hi';
import { complaintsAPI } from '../../../services/api';
import { getFileUrl } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

const Feedback = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const res = await complaintsAPI.getAll();
            setComplaints(res.data.complaints || []);
        } catch (err) {
            console.error('Load complaints error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('subject', subject);
            data.append('message', message);
            if (attachmentFile) {
                data.append('attachment', attachmentFile);
            }

            await complaintsAPI.submit(data);
            toast.success('Complaint filed successfully!');
            setSubject('');
            setMessage('');
            setAttachmentFile(null);
            loadComplaints();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const statusIcon = (status) => {
        if (status === 'Resolved') return <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
        return <HiOutlineClock className="w-4 h-4 text-amber-500" />;
    };

    const statusColor = (status) => {
        if (status === 'Resolved') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (status === 'In Progress') return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-slate-500 bg-slate-50 border-slate-200';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-4 sm:px-6">
            {/* Header */}
            <div className="flex items-center gap-5 pt-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 rotate-3">
                    <HiOutlineChatAlt2 className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Complaint Registry</h1>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-1.5 inline-block">
                        Support & Grievance
                    </p>
                </div>
            </div>

            {/* Submit Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">

                <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grievance Subject <span className="text-emerald-500">*</span></label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. Salary Delay, Technical Issue"
                        required
                    />
                </div>

                <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description <span className="text-emerald-500">*</span></label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 h-32 resize-none"
                        placeholder="Describe your issue in detail..."
                        required
                    />
                </div>

                <div className="space-y-1.5 relative z-10">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence / Documents (Optional)</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setAttachmentFile(e.target.files[0])}
                            className="hidden"
                            id="attachmentUpload"
                        />
                        <label
                            htmlFor="attachmentUpload"
                            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition-all cursor-pointer flex items-center justify-between group hover:border-emerald-400 hover:bg-emerald-50/10"
                        >
                            <span className={attachmentFile ? 'text-emerald-700 font-bold text-xs' : 'text-slate-400 font-semibold text-xs'}>
                                {attachmentFile ? `Selected: ${attachmentFile.name.substring(0, 25)}...` : 'Attach Screenshot or PDF'}
                            </span>
                            <HiOutlinePaperClip className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98] relative z-10"
                >
                    {submitting ? 'Transmitting...' : 'File Complaint'}
                </button>
            </form>

            {/* History */}
            <div className="space-y-5">
                <div className="flex items-center gap-4 ml-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Historical Records</h3>
                    <div className="h-px bg-slate-100 flex-1" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-6 h-6 border-2 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-3xl">
                        <HiOutlineChatAlt2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No previous complaints found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {complaints.map((c) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={c._id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl border transition-colors", statusColor(c.status))}>
                                            {statusIcon(c.status)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">{c.subject}</h4>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn("text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest", statusColor(c.status))}>
                                        {c.status}
                                    </span>
                                </div>

                                {c.message && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{c.message}"</p>
                                        {c.attachmentUrl && (
                                            <button
                                                onClick={() => window.open(getFileUrl(c.attachmentUrl), '_blank')}
                                                className="mt-3 flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                                            >
                                                <HiOutlinePaperClip className="w-3 h-3" />
                                                View Attachment
                                            </button>
                                        )}
                                    </div>
                                )}

                                {c.adminReply && (
                                    <div className="bg-emerald-50/50 rounded-xl p-4 mt-3 border-l-4 border-emerald-500 relative">
                                        <p className="text-[9px] font-black text-emerald-800 mb-1 uppercase tracking-widest flex items-center gap-2">
                                            <HiOutlineCheckCircle className="w-3 h-3" />
                                            Admin Response
                                        </p>
                                        <p className="text-xs text-emerald-700 font-bold leading-relaxed">{c.adminReply}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default Feedback;
