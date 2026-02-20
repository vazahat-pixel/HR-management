import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineDownload, HiOutlineEye, HiOutlineCheck, HiOutlineX, HiOutlineUserAdd, HiOutlineClipboardCopy, HiOutlineMail } from 'react-icons/hi';
import { joiningAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { cn, getFileUrl } from '../../../lib/utils';

const RequestDetailsModal = ({ request, onClose, onApprove, onReject }) => {
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-[#BBBBBB]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#DCDCDC]/60 rounded-[24px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="p-6 border-b border-[#DCDCDC]/40 flex justify-between items-center bg-[#F5F5F5]">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Joining Request Details</h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${request.status === 'Pending' ? 'bg-[#A55522]/10 text-[#A55522] border-[#A55522]/10' :
                                request.status === 'Approved' ? 'bg-[#3F7D58]/10 text-[#3F7D58] border-[#3F7D58]/10' :
                                    'bg-[#B23A48]/10 text-[#B23A48] border-[#B23A48]/10'
                                }`}>
                                {request.status} Status
                            </span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Logged {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#F9EBE0] hover:text-[#C46A2D] rounded-xl border border-[#DCDCDC] text-slate-400 transition-all shadow-sm">
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
                    {/* Personal Info */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                            Personal Details
                            <div className="h-px bg-slate-100 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'FULL NAME', value: request.fullName },
                                { label: "FATHER'S NAME", value: request.fatherName },
                                { label: "PARTNER'S NAME", value: request.partnerName },
                                { label: 'MOBILE NUMBER', value: request.mobile },
                                { label: 'EMAIL ADDRESS', value: request.email, className: 'lowercase' },
                                { label: 'DATE OF BIRTH', value: request.dob ? new Date(request.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A' },
                                { label: 'GENDER', value: request.gender },
                                { label: 'HUB NAME', value: request.hubName },
                                { label: 'RESIDENTIAL ADDRESS', value: request.address, colSpan: 3 },
                            ].map((item, i) => (
                                <div key={i} className={item.colSpan ? `col-span-${item.colSpan}` : ''}>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1.5">{item.label}</p>
                                    <p className={`text-slate-900 font-black tracking-tight ${item.className || ''}`}>{item.value || 'NOT_LOGGED'}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Banking Info */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                            Bank Details
                            <div className="h-px bg-slate-100 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'ACCOUNT HOLDER', value: request.accountName },
                                { label: 'ACCOUNT NUMBER', value: request.accountNumber },
                                { label: 'IFSC CODE', value: request.ifscCode },
                            ].map((item, i) => (
                                <div key={i}>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1.5">{item.label}</p>
                                    <p className="text-slate-900 font-black tracking-tight">{item.value || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Documents */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                            Uploaded Documents
                            <div className="h-px bg-slate-100 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Photo', src: request.photoUrl },
                                { label: 'AADHAAR FRONT', src: request.aadhaarImage },
                                { label: 'AADHAAR BACK', src: request.aadhaarBackImage },
                                { label: 'PAN Card', src: request.panImage }
                            ].map((doc, i) => (
                                <div key={i} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner group">
                                    <p className="text-[9px] text-slate-400 font-black uppercase mb-4 text-center tracking-widest">{doc.label}</p>
                                    {doc.src ? (
                                        <div className="relative group aspect-[4/3] bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm" onClick={() => window.open(getFileUrl(doc.src), '_blank')}>
                                            <img
                                                src={getFileUrl(doc.src)}
                                                alt={doc.label}
                                                crossOrigin="anonymous"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                                <span className="text-[10px] font-black text-white bg-white/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/30 uppercase tracking-[0.2em]">Examine</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] bg-white rounded-2xl flex items-center justify-center text-slate-300 text-[10px] font-black uppercase italic border-2 border-dashed border-slate-200">
                                            Missing Data
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Identity Numbers */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                            Fiscal Registration
                            <div className="h-px bg-[#DCDCDC]/40 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-[#F9EBE0]/30 rounded-2xl border border-[#F9EBE0]">
                                <p className="text-[9px] text-[#C46A2D] font-black uppercase tracking-widest mb-2">AADHAAR REFERENCE</p>
                                <p className="text-xl font-black text-slate-900 tracking-[0.2em]">{request.aadhaar || 'UNASSIGNED'}</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-[#DCDCDC]">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">PAN IDENTIFIER</p>
                                <p className="text-xl font-black text-slate-900 tracking-[0.2em]">{request.pan || 'UNASSIGNED'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {request.status === 'Pending' && (
                    <div className="p-6 border-t border-[#DCDCDC]/40 bg-[#F5F5F5] space-y-6">
                        {/* Approval Controls */}
                        <div className="bg-white p-5 rounded-2xl border border-[#DCDCDC] shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Onboarding Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block">Custom Employee ID</label>
                                    <input type="text" id="customEmployeeId" placeholder="Auto-Generate" className="w-full h-[42px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl px-4 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#C46A2D] uppercase tracking-wider" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block">Custom Password</label>
                                    <input type="text" id="customPassword" placeholder="Auto-Generate" className="w-full h-[42px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl px-4 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#C46A2D]" />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="sendEmail" defaultChecked className="w-5 h-5 rounded-lg border-2 border-[#DCDCDC] text-[#C46A2D] focus:ring-[#C46A2D] cursor-pointer" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#C46A2D] transition-colors">Dispatch Credentials</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => onReject(request._id)}
                                className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[#B23A48] bg-white border border-[#B23A48]/20 hover:bg-[#B23A48]/5 transition-all"
                            >
                                Deny Access
                            </button>
                            <button
                                onClick={() => {
                                    const customId = document.getElementById('customEmployeeId').value;
                                    const customPass = document.getElementById('customPassword').value;
                                    const sendMail = document.getElementById('sendEmail').checked;
                                    onApprove(request._id, { customEmployeeId: customId, customPassword: customPass, sendEmail: sendMail });
                                }}
                                className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#C46A2D] to-[#A55522] shadow-lg shadow-[#C46A2D]/20 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <HiOutlineCheck className="w-5 h-5" /> Confirm Onboarding
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const JoiningRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalData, setApprovalData] = useState(null); // { employeeId, password, fullName, email }
    const [emailSending, setEmailSending] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await joiningAPI.getAll();
            setRequests(res.data.requests);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, config) => {
        if (!window.confirm('Are you sure you want to approve this user? This will create an employee account.')) return;
        try {
            const res = await joiningAPI.approve(id, config);
            toast.success('User Approved Successfully!');
            setSelectedRequest(null);

            // Show duplicate modal with logic
            setApprovalData({
                fullName: res.data.employee.fullName,
                employeeId: res.data.employee.employeeId,
                password: res.data.tempPassword,
                email: res.data.employee.email
            });

            fetchRequests();
        } catch (error) {
            toast.error('Approval failed');
        }
    };

    const handleSendMail = async () => {
        if (!approvalData?.email) {
            toast.error('Employee email not found');
            return;
        }
        setEmailSending(true);
        try {
            await joiningAPI.sendCredentials({
                email: approvalData.email,
                employeeId: approvalData.employeeId,
                password: approvalData.password || '(Use your chosen password)',
                fullName: approvalData.fullName
            });
            toast.success('EMAIL DISPATCHED SUCCESSFULLY!');
        } catch (error) {
            toast.error('Email sending failed');
            console.error(error);
        } finally {
            setEmailSending(false);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this joining request?')) return;
        try {
            await joiningAPI.reject(id);
            toast.success('Request Rejected');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleExport = async () => {
        try {
            const res = await joiningAPI.exportExcel();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `Joining_Requests_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Export failed');
        }
    };

    // Filter Logic
    const filtered = requests.filter(req => {
        const matchesStatus = filter === 'All' || req.status === filter;
        const matchesSearch = req.fullName.toLowerCase().includes(search.toLowerCase()) ||
            req.mobile.includes(search);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#DCDCDC]/60 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase">Joining Requests</h1>
                    <p className="text-slate-500 text-[10px] mt-3 font-black uppercase tracking-widest">Orchestrating New User Synchronization</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-[#DCDCDC] shadow-sm hover:shadow-lg active:scale-95"
                    >
                        <HiOutlineDownload className="w-5 h-5 text-[#C46A2D]" /> Export Database
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-3 group">
                    <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#C46A2D] transition-all" />
                    <input
                        type="text"
                        placeholder="Search identities or mobile references..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-[52px] pl-14 pr-6 bg-white border border-[#DCDCDC] rounded-full text-xs text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#C46A2D]/10 focus:border-[#C46A2D] transition-all shadow-sm"
                    />
                </div>
                <div className="relative group">
                    <HiOutlineFilter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#C46A2D] transition-all" />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full h-[52px] pl-14 pr-10 bg-white border border-[#DCDCDC] rounded-full text-xs text-slate-900 font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-[#C46A2D]/10 focus:border-[#C46A2D] transition-all shadow-sm cursor-pointer"
                    >
                        <option value="All">All Identities</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-40">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Network Data...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-[48px] p-24 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <HiOutlineUserAdd className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-slate-900 text-xl font-black tracking-tight mb-2">No Requests Found</h3>
                    <p className="text-slate-400 font-medium italic">{filter !== 'All' ? `There are no ${filter.toLowerCase()} requests at the moment.` : 'No new registration requests available.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(req => (
                        <motion.div
                            key={req._id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-[#DCDCDC]/60 rounded-[20px] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl overflow-hidden shadow-inner border border-[#DCDCDC]/40 group-hover:rotate-3 transition-transform duration-500">
                                    {req.photoUrl ? (
                                        <img src={getFileUrl(req.photoUrl)} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl uppercase">
                                            {req.fullName[0]}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border shadow-sm ${req.status === 'Pending' ? 'bg-[#A55522]/10 text-[#A55522] border-[#A55522]/10' :
                                    req.status === 'Approved' ? 'bg-[#3F7D58]/10 text-[#3F7D58] border-[#3F7D58]/10' :
                                        'bg-[#B23A48]/10 text-[#B23A48] border-[#B23A48]/10'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">{req.fullName}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.mobile}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#F5F5F5] p-3 rounded-xl border border-[#DCDCDC]/50 group-hover:bg-white transition-colors">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hub Alias</p>
                                    <p className="text-[11px] font-bold text-slate-700 truncate">{req.hubName || 'N/A'}</p>
                                </div>
                                <div className="bg-[#F5F5F5] p-3 rounded-xl border border-[#DCDCDC]/50 group-hover:bg-white transition-colors">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Date</p>
                                    <p className="text-[11px] font-bold text-slate-700">{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedRequest(req)}
                                className="w-full py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:bg-black group-hover:bg-[#C46A2D] group-hover:shadow-[#C46A2D]/20 active:scale-95"
                            >
                                <HiOutlineEye className="w-5 h-5" /> Inspect Identity
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <RequestDetailsModal
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
            </AnimatePresence>    {/* Approval Success Modal */}
            {/* Approval Success Modal */}
            <AnimatePresence>
                {approvalData && (
                    <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-emerald-500/20 rounded-[40px] w-full max-w-md overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative p-10"
                        >
                            <div className="text-center">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner group">
                                    <HiOutlineCheck className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">REQUEST APPROVED</h2>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-10 leading-relaxed">Employee account activated. Share the credentials with the employee.</p>

                                <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 text-left space-y-6 shadow-inner">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">EMPLOYEE NAME</p>
                                        <p className="text-slate-900 font-black uppercase tracking-tight">{approvalData.fullName}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">EMPLOYEE ID</p>
                                            <p className="text-emerald-600 font-black text-xl tracking-widest">{approvalData.employeeId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">PASSWORD</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-slate-900 font-black text-lg">
                                                    {approvalData.password ? approvalData.password : <span className="text-slate-300 italic text-xs">SELF_SET</span>}
                                                </p>
                                                {approvalData.password && (
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(approvalData.password); toast.success('CREDENTIALS COPIED'); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm group"
                                                        title="Copy Password"
                                                    >
                                                        <HiOutlineClipboardCopy className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {approvalData.email && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSendMail}
                                        disabled={emailSending}
                                        className={`w-full mt-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${emailSending
                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-white border-[#C46A2D] text-[#C46A2D] hover:bg-[#F9EBE0]'
                                            }`}
                                    >
                                        {emailSending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[#C46A2D] border-t-transparent rounded-full animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineMail className="w-5 h-5" />
                                                Send via Email
                                            </>
                                        )}
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setApprovalData(null)}
                                    className="w-full mt-4 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs"
                                >
                                    Log Approved
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JoiningRequests;
