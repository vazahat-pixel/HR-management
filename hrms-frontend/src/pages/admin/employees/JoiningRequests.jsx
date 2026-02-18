import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineDownload, HiOutlineEye, HiOutlineCheck, HiOutlineX, HiOutlineUserAdd, HiOutlineClipboardCopy } from 'react-icons/hi';
import { joiningAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { cn, getFileUrl } from '../../../lib/utils';

const RequestDetailsModal = ({ request, onClose, onApprove, onReject }) => {
    // ... (unchanged)
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="bg-white border border-slate-200 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]"
            >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Request Details</h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${request.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {request.status} STATUS
                            </span>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">SUBMITTED ON {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-600 rounded-2xl border border-slate-100 text-slate-400 transition-all shadow-sm">
                        <HiOutlineX className="w-6 h-6" />
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
                            Banking Coordinates
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
                                    <p className="text-slate-900 font-black tracking-tight">{item.value || 'NOT_LOGGED'}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Documents */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                            Validation Artifacts
                            <div className="h-px bg-slate-100 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'ASSET PHOTO', src: request.photoUrl },
                                { label: 'AADHAAR FRONT', src: request.aadhaarImage },
                                { label: 'AADHAAR BACK', src: request.aadhaarBackImage },
                                { label: 'PAN REGISTER', src: request.panImage }
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
                            <div className="h-px bg-slate-100 flex-1" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100">
                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-2">AADHAAR REFERENCE</p>
                                <p className="text-xl font-black text-slate-900 tracking-[0.2em]">{request.aadhaar || 'UNASSIGNED'}</p>
                            </div>
                            <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100">
                                <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mb-2">PAN IDENTIFIER</p>
                                <p className="text-xl font-black text-slate-900 tracking-[0.2em]">{request.pan || 'UNASSIGNED'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {request.status === 'Pending' && (
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-6">
                        {/* Approval Controls */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Onboarding Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block">Custom Employee ID (Optional)</label>
                                    <input type="text" id="customEmployeeId" placeholder="Auto-Generate" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 uppercase tracking-wider" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block">Custom Password (Optional)</label>
                                    <input type="text" id="customPassword" placeholder="Auto-Generate" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500" />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="sendEmail" defaultChecked className="w-5 h-5 rounded-lg border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Dispatch Credentials via Email</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onReject(request._id)}
                                className="px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-100 transition-all shadow-sm"
                            >
                                Deny Access
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const customId = document.getElementById('customEmployeeId').value;
                                    const customPass = document.getElementById('customPassword').value;
                                    const sendMail = document.getElementById('sendEmail').checked;
                                    onApprove(request._id, { customEmployeeId: customId, customPassword: customPass, sendEmail: sendMail });
                                }}
                                className="px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-emerald-600 shadow-2xl shadow-slate-200 transition-all flex items-center gap-3"
                            >
                                <HiOutlineCheck className="w-5 h-5 text-emerald-400" /> Confirm Onboarding
                            </motion.button>
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
    const [approvalData, setApprovalData] = useState(null); // { employeeId, password, fullName }

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
                password: res.data.tempPassword
            });

            fetchRequests();
        } catch (error) {
            toast.error('Approval failed');
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Joining Requests</h1>
                    <p className="text-slate-500 text-sm mt-3 font-medium italic">Review and manage new employee registrations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 shadow-lg shadow-slate-100"
                    >
                        <HiOutlineDownload className="w-5 h-5 text-indigo-500" /> Export Ledger
                    </motion.button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-3 group">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or mobile..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-extrabold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                </div>
                <div className="relative group">
                    <HiOutlineFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-extrabold appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                    >
                        <option value="All">All Requests</option>
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
                            initial={{ opacity: 0, translateY: 15 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            whileHover={{ translateY: -4 }}
                            className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-20 h-20 bg-slate-50 rounded-[28px] overflow-hidden shadow-inner border border-slate-100 group-hover:rotate-3 transition-transform duration-500">
                                    {req.photoUrl ? (
                                        <img src={getFileUrl(req.photoUrl)} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl uppercase">
                                            {req.fullName[0]}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="space-y-1 mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{req.fullName}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.mobile}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">HUB NAME</p>
                                    <p className="text-xs font-black text-slate-700 truncate">{req.hubName || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">REQUEST DATE</p>
                                    <p className="text-xs font-black text-slate-700">{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRequest(req)}
                                className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group-hover:bg-indigo-600"
                            >
                                <HiOutlineEye className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" /> VIEW DETAILS
                            </motion.button>
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

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setApprovalData(null)}
                                    className="w-full mt-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs"
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
