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

    const statusStyle = (status) => {
        if (status === 'Approved') return 'text-[#3F7D58] bg-[#3F7D58]/5 border-[#3F7D58]/20';
        if (status === 'Rejected') return 'text-[#B23A48] bg-[#B23A48]/5 border-[#B23A48]/20';
        return 'text-[#C46A2D] bg-[#F9EBE0] border-[#F9EBE0]';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 md:p-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Advance Requests</h1>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                        Manage Salary Advances
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white border border-[#DCDCDC] rounded-[32px] py-32 text-center shadow-sm">
                    <div className="w-10 h-10 border-[3px] border-[#F5F5F5] border-t-[#C46A2D] rounded-full animate-spin mx-auto" />
                    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Requests...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((r) => (
                        <div key={r._id}
                            className="bg-white border border-[#DCDCDC]/60 rounded-[32px] p-7 space-y-6 hover:shadow-2xl hover:shadow-[#C46A2D]/10 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9EBE0]/20 to-transparent -mr-16 -mt-16 rounded-full" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-[#C46A2D] border border-[#DCDCDC]/40 shadow-inner group-hover:rotate-6 transition-transform">
                                        <HiOutlineCash className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tighter">₹{r.amount?.toLocaleString()}</h4>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{r.userId?.fullName || 'N/A'}</p>
                                    </div>
                                </div>
                                <span className={`text-[8px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${statusStyle(r.status)}`}>{r.status}</span>
                            </div>

                            <div className="bg-[#F5F5F5]/50 rounded-2xl p-5 border border-[#DCDCDC]/30 min-h-[80px] flex items-center relative z-10">
                                <p className="text-[12px] text-slate-600 font-bold leading-relaxed tracking-tight italic">"{r.reason}"</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-[#DCDCDC]/40 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Date</p>
                                    <span className="text-[11px] text-slate-900 font-black uppercase">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {r.status === 'Pending' && (
                                    <button onClick={() => { setSelectedRequest(r); setShowModal(true); }}
                                        className="text-[10px] font-black text-white bg-gradient-to-r from-[#C46A2D] to-[#A55522] px-6 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg hover:shadow-[#C46A2D]/20 active:scale-95 cursor-pointer">
                                        Review
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && (
                        <div className="col-span-full bg-white border-2 border-dashed border-[#DCDCDC] rounded-[48px] py-40 text-center shadow-inner">
                            <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs italic">NO_ACTIVE_TELEMETRY</p>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Audit Advance Matrix" maxWidth="max-w-xl">
                {selectedRequest && (
                    <div className="space-y-8 p-8">
                        {/* Summary Header */}
                        <div className="flex items-center gap-6 p-6 bg-[#F5F5F5] rounded-[28px] border border-[#DCDCDC]/60 shadow-inner">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#C46A2D] text-2xl font-black border border-[#DCDCDC]/40 shadow-sm">
                                {selectedRequest.userId?.fullName?.[0]}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">{selectedRequest.userId?.fullName}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedRequest.userId?.employeeId} • <span className="text-[#C46A2D]">{selectedRequest.hubName || 'GLOBAL'}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{selectedRequest.amount?.toLocaleString()}</p>
                                <p className="text-[9px] text-[#C46A2D] uppercase font-black tracking-widest mt-1">Delta Value</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ['REQUIRED BY', selectedRequest.dateRequired ? new Date(selectedRequest.dateRequired).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'ASAP', 'text-slate-900'],
                                ['FISCAL_BASE', `₹${selectedRequest.currentSalary?.toLocaleString() || '0'}`, 'text-slate-900'],
                                ['LIABILITY', `₹${selectedRequest.pendingAdvance?.toLocaleString() || '0'}`, 'text-[#B23A48]'],
                                ['ORIGIN_HUB', selectedRequest.hubName || 'N/A', 'text-slate-900'],
                            ].map(([label, value, color]) => (
                                <div key={label} className="p-5 bg-white border border-[#DCDCDC] rounded-2xl space-y-1.5 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                    <p className={`text-[13px] font-black uppercase tracking-tight ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Justification & Verification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Rationale</label>
                                <div className="p-6 bg-[#F5F5F5] rounded-2xl border border-[#DCDCDC]/40 text-[13px] text-slate-700 italic font-bold leading-relaxed shadow-inner">
                                    "{selectedRequest.reason}"
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity QR Proof</label>
                                <div className="aspect-square bg-[#F5F5F5] rounded-2xl border border-[#DCDCDC] overflow-hidden flex items-center justify-center p-1 shadow-inner group relative">
                                    {selectedRequest.qrCodeUrl ? (
                                        <>
                                            <img src={getFileUrl(selectedRequest.qrCodeUrl)} alt="QR Code" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
                                            <button onClick={() => window.open(getFileUrl(selectedRequest.qrCodeUrl), '_blank')}
                                                className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-xl cursor-pointer">
                                                <span className="text-[9px] font-black text-white bg-white/20 px-5 py-2 rounded-full border border-white/30 uppercase tracking-[0.2em]">Full Manifest</span>
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[9px] font-black text-slate-300 italic uppercase">NULL_MANIFEST</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decision Console */}
                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Audit Remarks</label>
                                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full bg-[#F5F5F5] border border-[#DCDCDC] rounded-2xl px-6 py-4 text-xs text-slate-900 font-bold resize-none outline-none h-24 focus:bg-white focus:border-[#C46A2D] transition-all placeholder:text-slate-300"
                                    placeholder="Log technical remarks here..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleAction('Rejected')} disabled={actionLoading}
                                    className="py-4 bg-white text-slate-400 hover:text-[#B23A48] border border-[#DCDCDC] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-95">
                                    Deny Entry
                                </button>
                                <button onClick={() => handleAction('Approved')} disabled={actionLoading}
                                    className="py-4 bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-[#C46A2D]/20 transition-all cursor-pointer active:scale-95">
                                    Authorize Flow
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdvanceManagement;
