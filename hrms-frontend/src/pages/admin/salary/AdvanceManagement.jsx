import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCash, HiOutlineCheck, HiOutlineX, HiOutlineClock } from 'react-icons/hi';
import { advanceAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import { getFileUrl } from '../../../lib/utils';

const AdvanceManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        try {
            const res = await advanceAPI.getAll();
            setRequests(res.data.requests || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAction = async (status) => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            await advanceAPI.update(selectedRequest._id, { status, adminRemarks: remarks });
            setShowModal(false);
            setRemarks('');
            loadRequests();
        } catch (err) { alert(err.response?.data?.error || 'Action failed'); }
        finally { setActionLoading(false); }
    };

    const statusColor = (status) => {
        if (status === 'Approved') return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (status === 'Rejected') return 'text-rose-700 bg-rose-50 border-rose-100';
        return 'text-amber-700 bg-amber-50 border-amber-100';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Advance Requests</h1>
                <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-[0.3em] flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Manage employee advance requests
                </p>
            </div>

            {loading ? (
                <div className="bg-white border border-slate-100 rounded-[40px] py-32 text-center shadow-lg">
                    <div className="w-12 h-12 border-[3px] border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Ledger...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((r) => (
                        <motion.div key={r._id} whileHover={{ translateY: -4 }}
                            className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                                        <HiOutlineCash className="w-6 h-6 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">₹{r.amount?.toLocaleString()}</h4>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{r.userId?.fullName || 'UNKNOWN'}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${statusColor(r.status)}`}>{r.status}</span>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 min-h-[70px] flex items-center">
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic">" {r.reason} "</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Request Date</p>
                                    <span className="text-[10px] text-slate-500 font-black">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                {r.status === 'Pending' && (
                                    <button onClick={() => { setSelectedRequest(r); setShowModal(true); }}
                                        className="text-[9px] font-black text-white bg-slate-900 hover:bg-emerald-600 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-xl shadow-slate-200 cursor-pointer">
                                        Review Request
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {requests.length === 0 && (
                        <div className="col-span-full bg-white border-2 border-dashed border-slate-100 rounded-[48px] py-32 text-center shadow-inner italic text-slate-300 font-black uppercase tracking-widest">
                            No active requests found.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Advance Request" maxWidth="max-w-xl">
                {selectedRequest && (
                    <div className="space-y-8 py-2">
                        {/* Summary Header */}
                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 text-2xl font-black border border-slate-100">
                                {selectedRequest.userId?.fullName?.[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{selectedRequest.userId?.fullName}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedRequest.userId?.employeeId} • {selectedRequest.hubName || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{selectedRequest.amount?.toLocaleString()}</p>
                                <p className="text-[9px] text-emerald-600 uppercase font-black tracking-widest mt-1">Request Amount</p>
                            </div>
                        </div>

                        {/* Details Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-1 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required By</p>
                                <p className="text-sm font-black text-slate-900">{selectedRequest.dateRequired ? new Date(selectedRequest.dateRequired).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'NOT_SPECIFIED'}</p>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-1 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Salary</p>
                                <p className="text-sm font-black text-slate-900">₹{selectedRequest.currentSalary?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-1 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Liability</p>
                                <p className="text-sm font-black text-rose-600">₹{selectedRequest.pendingAdvance?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-1 shadow-sm">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hub Name</p>
                                <p className="text-sm font-black text-slate-900">{selectedRequest.hubName || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Justification & Verification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee's Reason</label>
                                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 text-sm text-slate-600 italic font-medium leading-relaxed shadow-inner">
                                    "{selectedRequest.reason}"
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Proof (QR Code)</label>
                                <div className="aspect-square bg-slate-50 rounded-[28px] border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-inner group relative">
                                    {selectedRequest.qrCodeUrl ? (
                                        <>
                                            <img src={getFileUrl(selectedRequest.qrCodeUrl)} alt="QR Code" className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                                            <button onClick={() => window.open(getFileUrl(selectedRequest.qrCodeUrl), '_blank')}
                                                className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-2xl">
                                                <span className="text-[8px] font-black text-white bg-white/20 px-4 py-1.5 rounded-full border border-white/30 uppercase tracking-[0.2em]">View Proof</span>
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 italic">No QR Code Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decision Console */}
                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Remarks (Optional)</label>
                                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-4 text-sm text-slate-900 font-bold resize-none outline-none h-24 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 placeholder:text-slate-200"
                                    placeholder="Enter remarks for the employee..." />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAction('Rejected')} disabled={actionLoading}
                                    className="py-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm">
                                    Deny Request
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAction('Approved')} disabled={actionLoading}
                                    className="py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all cursor-pointer shadow-2xl shadow-slate-200">
                                    Approve Advance
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdvanceManagement;
