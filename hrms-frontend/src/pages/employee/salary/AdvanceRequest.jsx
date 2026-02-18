import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { HiOutlineCash, HiOutlinePaperAirplane, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineUser, HiOutlineBadgeCheck, HiOutlineOfficeBuilding, HiOutlineCalendar, HiOutlineUpload } from 'react-icons/hi';
import { advanceAPI } from '../../../services/api';
import { getFileUrl } from '../../../lib/utils';

const AdvanceRequest = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: user?.email || '',
        partnerName: user?.partnerName || '',
        profileId: user?.profileId || '',
        phone: user?.mobile || '',
        amount: '',
        reason: '',
        dateRequired: '',
        currentSalary: '',
        pendingAdvance: '',
        hubName: user?.hubName || ''
    });
    const [qrCodeFile, setQrCodeFile] = useState(null);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadRequests();
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                partnerName: user.partnerName || '',
                profileId: user.profileId || '',
                phone: user.mobile || '',
                hubName: user.hubName || ''
            }));
        }
    }, [user]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await advanceAPI.getAll();
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error('Load advances error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.amount || formData.amount <= 0) {
            setError('Valid amount is required.');
            return;
        }
        if (!formData.email || !formData.partnerName || !formData.profileId || !formData.phone) {
            setError('All required fields must be filled.');
            return;
        }
        if (!qrCodeFile) {
            setError('QR code upload is required.');
            return;
        }

        setSubmitting(true);
        setSuccessMsg('');
        setError('');

        try {
            const data = new FormData();
            data.append('email', formData.email);
            data.append('partnerName', formData.partnerName);
            data.append('profileId', formData.profileId);
            data.append('phone', formData.phone);
            data.append('amount', Number(formData.amount));
            data.append('reason', formData.reason);
            data.append('dateRequired', formData.dateRequired);
            data.append('currentSalary', Number(formData.currentSalary));
            data.append('pendingAdvance', Number(formData.pendingAdvance));
            data.append('hubName', formData.hubName);
            data.append('qrCode', qrCodeFile);

            await advanceAPI.submit(data);
            setSuccessMsg('Request submitted successfully.');
            setFormData({
                email: user?.email || '',
                partnerName: user?.partnerName || '',
                profileId: user?.profileId || '',
                phone: user?.mobile || '',
                amount: '',
                reason: '',
                dateRequired: '',
                currentSalary: '',
                pendingAdvance: '',
                hubName: user?.hubName || ''
            });
            setQrCodeFile(null);
            loadRequests();
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const statusIcon = (status) => {
        if (status === 'Approved') return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />;
        if (status === 'Rejected') return <HiOutlineXCircle className="w-5 h-5 text-rose-500" />;
        return <HiOutlineClock className="w-5 h-5 text-amber-500" />;
    };

    const statusColor = (status) => {
        if (status === 'Approved') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (status === 'Rejected') return 'text-rose-700 bg-rose-50 border-rose-100';
        return 'text-amber-700 bg-amber-50 border-amber-100';
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium text-sm";
    const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4 sm:px-6">
            <div className="text-center pt-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <HiOutlineCash className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advance Request</h1>
                <p className="text-slate-400 text-xs font-medium mt-2 max-w-xs mx-auto">
                    Submit a secure request for salary advance.
                </p>
            </div>

            {/* Submit Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">

                    {/* Read-Only Info */}
                    <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 md:col-span-2">
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="font-bold flex items-center gap-1"><HiOutlineUser className="w-3.5 h-3.5" /> {user?.fullName}</span>
                            <span className="font-bold flex items-center gap-1"><HiOutlineBadgeCheck className="w-3.5 h-3.5" /> {user?.employeeId}</span>
                            <span className="font-bold flex items-center gap-1"><HiOutlineOfficeBuilding className="w-3.5 h-3.5" /> {formData.hubName}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Email Address <span className="text-emerald-500">*</span></label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Partner Name <span className="text-emerald-500">*</span></label>
                        <input
                            type="text"
                            value={formData.partnerName}
                            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Phone Number <span className="text-emerald-500">*</span></label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputCls}
                            placeholder="+91..."
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Amount Required (₹) <span className="text-emerald-500">*</span></label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className={inputCls}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Required Date</label>
                        <input
                            type="date"
                            value={formData.dateRequired}
                            onChange={(e) => setFormData({ ...formData, dateRequired: e.target.value })}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className={labelCls}>QR Code Upload <span className="text-emerald-500">*</span></label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setQrCodeFile(e.target.files[0])}
                                className="hidden"
                                id="qrCodeUpload"
                                required
                            />
                            <label
                                htmlFor="qrCodeUpload"
                                className={`${inputCls} cursor-pointer flex items-center justify-between group hover:border-emerald-500 hover:bg-emerald-50/30 dashed border-2 border-slate-200`}
                            >
                                <span className={qrCodeFile ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                                    {qrCodeFile ? qrCodeFile.name : 'Select File (PDF/Image)'}
                                </span>
                                <HiOutlineUpload className="w-5 h-5 text-emerald-500" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className={labelCls}>Reason</label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className={inputCls}
                            placeholder="Brief reason for advance..."
                            required
                        />
                    </div>
                </div>

                <div className="mt-8">
                    {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2"><HiOutlineCheckCircle className="w-4 h-4" /> {successMsg}</div>}
                    {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-2"><HiOutlineXCircle className="w-4 h-4" /> {error}</div>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Submitting...' : 'Submit Request'} <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                    </button>
                </div>
            </form>

            {/* Request History */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Request History</h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-medium">No previous requests.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map((r) => (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={r._id}
                                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${statusColor(r.status)}`}>
                                            {statusIcon(r.status)}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900">₹{r.amount?.toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>{r.status}</span>
                                </div>

                                {r.reason && <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">"{r.reason}"</p>}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    {r.qrCodeUrl && (
                                        <button
                                            onClick={() => window.open(getFileUrl(r.qrCodeUrl), '_blank')}
                                            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                        >
                                            <HiOutlineUpload className="w-3 h-3" /> View QR
                                        </button>
                                    )}
                                    {r.adminRemarks && (
                                        <span className="text-[10px] text-amber-600 font-bold ml-auto bg-amber-50 px-2 py-0.5 rounded">
                                            Admin: {r.adminRemarks}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvanceRequest;
