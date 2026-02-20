import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineCheck, HiOutlineX, HiOutlineCash, HiOutlineDownload } from 'react-icons/hi';
import { employeesAPI, joiningAPI, payrollAPI, authAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import Skeleton, { ListSkeleton } from '../../../components/ui/Skeleton';
import { cn, getFileUrl } from '../../../lib/utils';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [joiningRequests, setJoiningRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showJoiningModal, setShowJoiningModal] = useState(false);
    const [addForm, setAddForm] = useState({
        fullName: '', employeeId: '', mobile: '', designation: '', department: '',
        officeLocation: '', baseRate: '', conveyance: '', hubName: '',
        aadhaar: '', pan: '', email: '', bankAccount: '', ifscCode: '', profileId: '', ehrId: ''
    });
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [salaryForm, setSalaryForm] = useState({ baseRate: 0, conveyance: 0, otherAllowances: 0, incentiveRate: 0, tdsRate: 1 });
    const [salaryLoading, setSalaryLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addResult, setAddResult] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null); // For detailed joining view

    const handleSalaryConfig = async (emp) => {
        setSelectedEmployee(emp);
        setSalaryLoading(true);
        try {
            const res = await payrollAPI.getSalaryStructure(emp._id);
            setSalaryForm(res.data.salary);
            setShowSalaryModal(true);
        } catch (err) { console.error(err); }
        finally { setSalaryLoading(false); }
    };

    const handleSalaryUpdate = async (e) => {
        e.preventDefault();
        try {
            await payrollAPI.updateSalaryStructure(selectedEmployee._id, salaryForm);
            setShowSalaryModal(false);
            alert('Salary structure updated');
        } catch (err) { alert('Update failed'); }
    };

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [empRes, joinRes] = await Promise.all([
                employeesAPI.getAll({ search }),
                joiningAPI.getAll({ status: 'Pending' }),
            ]);
            setEmployees(empRes.data.employees || []);
            setJoiningRequests(joinRes.data.requests || []);
        } catch (err) { console.error('Load error:', err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); loadData(); };

    const handleView = (emp) => { setSelectedEmployee(emp); setShowViewModal(true); };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            await employeesAPI.delete(id);
            setEmployees(prev => prev.filter(e => e._id !== id));
        } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddResult(null);
        try {
            const res = await authAPI.register({
                ...addForm,
                baseRate: Number(addForm.baseRate) || 0,
                conveyance: Number(addForm.conveyance) || 0,
            });
            setAddResult({ success: true, msg: `Employee created! Temp Password: ${res.data.tempPassword}` });
            setAddForm({
                fullName: '', employeeId: '', mobile: '', designation: '', department: '',
                officeLocation: '', baseRate: '', conveyance: '', hubName: '',
                aadhaar: '', pan: '', email: '', bankAccount: '', ifscCode: '', profileId: '', ehrId: ''
            });
            loadData();
        } catch (err) {
            setAddResult({ success: false, msg: err.response?.data?.error || 'Failed to register' });
        } finally { setAddLoading(false); }
    };

    const handleApproveJoining = async (id) => {
        // id here is the JoiningRequest ID, but our new route expects User ID?
        // Let's check the joining request object. It has `userId`.
        // We need to pass the User ID to the approve route.
        // Wait, the UI uses `selectedRequest` which is a JoiningRequest object.
        // `selectedRequest.userId` should be passed.

        if (!confirm('Approve this joining request? The user will become an active employee.')) return;
        try {
            // Find the request in the list to get userId if not selected
            const req = joiningRequests.find(r => r._id === id) || selectedRequest;
            if (!req?.userId) {
                alert('Error: No User linked to this request.');
                return;
            }

            const res = await authAPI.approveJoining(req.userId);
            alert(`Approved! Employee ID: ${res.data.employee.employeeId}, Password: ${res.data.tempPassword} \n(In production, this is sent via SMS)`);
            loadData();
            setSelectedRequest(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleRejectJoining = async (id) => {
        if (!confirm('Reject this request? User will be blocked.')) return;
        try {
            const req = joiningRequests.find(r => r._id === id) || selectedRequest;
            if (!req?.userId) return;

            await authAPI.rejectJoining(req.userId);
            loadData();
            setSelectedRequest(null);
        } catch (err) { alert(err.response?.data?.error || 'Failed to reject'); }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Employee Directory</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-[#3F7D58] rounded-full animate-pulse" />
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">{employees.length} Active Employees</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {joiningRequests.length > 0 && (
                        <button onClick={() => setShowJoiningModal(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-[#F9EBE0] text-[#A55522] border border-[#F9EBE0] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F9EBE0]/80 transition-all cursor-pointer group shadow-sm">
                            <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full group-hover:scale-150 transition-transform" />
                            {joiningRequests.length} Pending Onboarding
                        </button>
                    )}
                    <button onClick={() => { setShowAddModal(true); setAddResult(null); setAddForm({ fullName: '', employeeId: '', mobile: '', designation: '', department: '', officeLocation: '', baseRate: '', conveyance: '', hubName: '', aadhaar: '', pan: '', email: '' }); }}
                        className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-[#C46A2D]/20 transition-all cursor-pointer group active:scale-95">
                        <HiOutlinePlus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> New Identity
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <form onSubmit={handleSearch} className="relative flex-1 group">
                    <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#C46A2D] transition-colors" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee database..."
                        className="w-full h-[52px] bg-white border border-[#DCDCDC] rounded-full pl-14 pr-6 py-4 text-[13px] text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#C46A2D]/5 focus:border-[#C46A2D] transition-all outline-none shadow-sm" />
                </form>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="bg-white/50 border border-slate-100 rounded-[32px] p-8 space-y-6">
                    <Skeleton className="w-1/4 h-6 mb-8" />
                    <ListSkeleton count={8} />
                </div>
            ) : (
                <div className="bg-white border border-[#DCDCDC]/60 rounded-[28px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-[#DCDCDC]/40 bg-[#F5F5F5]">
                                {['Identity', 'Internal Reference', 'Sector', 'Compliance', 'Lifecycle', 'Operations'].map(h => (
                                    <th key={h} className="text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] px-8 py-5">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="border-b border-[#DCDCDC]/20 hover:bg-[#F5F5F5] transition-all duration-300 group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[11px] font-black text-[#C46A2D] border border-[#DCDCDC]/40 group-hover:bg-white transition-colors">
                                                    {emp.fullName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none uppercase">{emp.fullName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{emp.designation || 'Specialist'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[10px] font-black text-slate-600 bg-[#F5F5F5] px-3.5 py-1.5 rounded-lg border border-[#DCDCDC]/40 uppercase tracking-widest">{emp.employeeId}</span>
                                        </td>
                                        <td className="px-8 py-4 text-[11px] text-slate-500 font-black uppercase tracking-tight">{emp.department || 'General'}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex gap-2 items-center">
                                                <div className={`w-2.5 h-2.5 rounded-full ${emp.aadhaar ? 'bg-[#3F7D58]' : 'bg-[#DCDCDC]'}`} title="Aadhaar" />
                                                <div className={`w-2.5 h-2.5 rounded-full ${emp.pan ? 'bg-[#3F7D58]' : 'bg-[#DCDCDC]'}`} title="PAN" />
                                                <div className={`w-2.5 h-2.5 rounded-full ${emp.bankAccount ? 'bg-[#3F7D58]' : 'bg-[#DCDCDC]'}`} title="Bank" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={cn(
                                                "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] border transition-all",
                                                emp.status === 'Active' ? 'text-[#3F7D58] bg-[#3F7D58]/5 border-[#3F7D58]/10' : 'text-slate-400 bg-white border-[#DCDCDC]'
                                            )}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleView(emp)} className="p-2 rounded-xl bg-white border border-[#DCDCDC] text-slate-400 hover:text-[#C46A2D] hover:border-[#F9EBE0] hover:bg-[#F9EBE0] transition-all cursor-pointer group/btn">
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleSalaryConfig(emp)} className="p-2 rounded-xl bg-white border border-[#DCDCDC] text-slate-400 hover:text-[#C46A2D] hover:border-[#F9EBE0] hover:bg-[#F9EBE0] transition-all cursor-pointer group/btn">
                                                    <HiOutlineCash className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp._id)} className="p-2 rounded-xl bg-white border border-[#DCDCDC] text-slate-400 hover:text-[#B23A48] hover:border-[#B23A48]/10 hover:bg-[#B23A48]/5 transition-all cursor-pointer group/btn">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Employee Modal */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Operational Profile" maxWidth="max-w-2xl">
                {selectedEmployee && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-[#DCDCDC]/40">
                        <div className="space-y-6 p-8">
                            <h3 className="text-[10px] font-black text-[#C46A2D] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                                Personal Schema
                            </h3>
                            <div className="space-y-5">
                                {[
                                    ['Full Name', selectedEmployee.fullName],
                                    ['Internal ID', selectedEmployee.employeeId],
                                    ['Mobile Link', selectedEmployee.mobile],
                                    ['Email Node', selectedEmployee.email || 'N/A'],
                                    ['Designation', selectedEmployee.designation || 'N/A'],
                                    ['Sector', selectedEmployee.department || 'N/A'],
                                    ['Hub Origin', selectedEmployee.hubName || 'N/A'],
                                    ['Sync Date', new Date(selectedEmployee.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })],
                                ].map(([label, value]) => (
                                    <div key={label} className="group">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                                        <p className="text-[13px] text-slate-900 font-bold group-hover:text-[#C46A2D] transition-colors uppercase tracking-tight">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6 p-8 bg-[#F5F5F5]/30">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-slate-300 rounded-full" />
                                Compliance & Fiscal
                            </h3>
                            <div className="space-y-5">
                                {[
                                    ['Aadhaar Ref', selectedEmployee.aadhaar ? selectedEmployee.aadhaar : 'PENDING', !!selectedEmployee.aadhaar],
                                    ['PAN Handle', selectedEmployee.pan ? selectedEmployee.pan : 'PENDING', !!selectedEmployee.pan],
                                    ['Profile Hash', selectedEmployee.profileId || 'N/A'],
                                    ['Bank Account', selectedEmployee.bankAccount ? selectedEmployee.bankAccount : 'PENDING', !!selectedEmployee.bankAccount],
                                    ['IFSC Code', selectedEmployee.ifscCode || 'N/A'],
                                    ['Base Ledger', `₹${selectedEmployee.baseRate || 0}`],
                                    ['Allowance', `₹${selectedEmployee.conveyance || 0}`],
                                    ['Node Status', selectedEmployee.status],
                                ].map(([label, value, exists]) => (
                                    <div key={label} className="group">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                                        <p className={`text-[13px] font-bold ${exists === false ? 'text-[#B23A48] italic' : 'text-slate-900 group-hover:text-[#A55522] transition-colors uppercase tracking-tight'}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Employee Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee" maxWidth="max-w-lg">
                <form onSubmit={handleAdd} className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'fullName', label: 'Full Name *', type: 'text', required: true },
                            { key: 'employeeId', label: 'Internal ID *', type: 'text', required: true },
                            { key: 'mobile', label: 'Primary Contact *', type: 'tel', required: true },
                            { key: 'email', label: 'Email Node', type: 'email' },
                            { key: 'ehrId', label: 'EHR Reference', type: 'text' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full h-[46px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl px-4 text-xs text-slate-900 font-bold focus:bg-white focus:border-[#C46A2D] outline-none transition-all"
                                    required={field.required} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'designation', label: 'Designation', type: 'text' },
                            { key: 'department', label: 'Sector', type: 'text' },
                            { key: 'officeLocation', label: 'Base Location', type: 'text' },
                            { key: 'hubName', label: 'Hub Origin', type: 'text' },
                            { key: 'profileId', label: 'Profile Hash', type: 'text' },
                            { key: 'bankAccount', label: 'Bank Account', type: 'text' },
                            { key: 'ifscCode', label: 'IFSC Node', type: 'text' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full h-[46px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl px-4 text-xs text-slate-900 font-bold focus:bg-white focus:border-[#C46A2D] outline-none transition-all" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-[#F9EBE0]/30 p-5 rounded-2xl border border-[#F9EBE0]">
                        {[
                            { key: 'baseRate', label: 'Base Rate (₹)', type: 'number' },
                            { key: 'conveyance', label: 'Conveyance (₹)', type: 'number' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#C46A2D] uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full h-[46px] bg-white border border-[#F9EBE0] rounded-xl px-4 text-xs text-slate-900 font-black focus:ring-4 focus:ring-[#C46A2D]/10 focus:border-[#C46A2D] outline-none transition-all" />
                            </div>
                        ))}
                    </div>
                    {addResult && (
                        <div className={`p-4 rounded-xl text-[10px] font-black uppercase text-center tracking-widest border ${addResult.success ? 'bg-[#3F7D58]/5 text-[#3F7D58] border-[#3F7D58]/20' : 'bg-[#B23A48]/5 text-[#B23A48] border-[#B23A48]/20'}`}>
                            {addResult.msg}
                        </div>
                    )}
                    <button type="submit" disabled={addLoading}
                        className="w-full py-4 bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white font-black rounded-xl hover:shadow-xl hover:shadow-[#C46A2D]/20 transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-2 uppercase text-[11px] tracking-[0.2em]">
                        {addLoading ? 'Synchronizing...' : 'Register New Identity'}
                    </button>
                </form>
            </Modal>

            {/* Joining Requests Modal */}
            <Modal isOpen={showJoiningModal} onClose={() => setShowJoiningModal(false)} title="Joining Requests" maxWidth={selectedRequest ? "max-w-4xl" : "max-w-2xl"}>
                {!selectedRequest ? (
                    // List View
                    <div className="grid gap-3 p-6 bg-[#F5F5F5]">
                        {joiningRequests.map((req) => (
                            <div
                                key={req._id}
                                className="bg-white border border-[#DCDCDC]/60 rounded-2xl p-4 flex justify-between items-center hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => setSelectedRequest(req)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center overflow-hidden border border-[#DCDCDC]/40 group-hover:rotate-3 transition-transform">
                                        {req.photoUrl ? (
                                            <img src={getFileUrl(req.photoUrl)} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-black text-slate-300">{req.fullName[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-tight uppercase">{req.fullName}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-[#C46A2D] transition-colors">{req.mobile} • <span className="text-slate-500">{req.hubName || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-[#A55522] bg-[#F9EBE0] border border-[#F9EBE0] px-3 py-1 rounded-full uppercase tracking-widest">PENDING</span>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                </div>
                            </div>
                        ))}
                        {joiningRequests.length === 0 && <p className="text-center text-slate-400 font-bold italic tracking-tight py-12 bg-white rounded-2xl border border-dashed border-[#DCDCDC]">NO PENDING TELEMETRY</p>}
                    </div>
                ) : (
                    // Detail View
                    <div className="space-y-8 p-6">
                        <button onClick={() => setSelectedRequest(null)} className="text-[10px] font-black px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <span>←</span> DATA INDEX
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-[#C46A2D] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-[#C46A2D] rounded-full" />
                                    Bio-Metric Interface
                                </h3>
                                <div className="space-y-4 px-2">
                                    {[
                                        ['LEGAL NAME', selectedRequest.fullName],
                                        ['PATERNAL', selectedRequest.fatherName],
                                        ['PARTNER', selectedRequest.partnerName],
                                        ['PROFILE ID', selectedRequest.profileId],
                                        ['CHRONO', selectedRequest.dob ? new Date(selectedRequest.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'],
                                        ['GENDER', selectedRequest.gender],
                                        ['CONTACT', selectedRequest.mobile],
                                        ['HUB', selectedRequest.hubName],
                                        ['BASE', selectedRequest.officeLocation],
                                        ['FISCAL ACC', selectedRequest.bankAccount],
                                        ['IFSC NODE', selectedRequest.ifscCode],
                                        ['RESIDENCE', selectedRequest.address],
                                        ['AADHAAR', selectedRequest.aadhaar],
                                        ['PAN', selectedRequest.pan],
                                    ].map(([label, val]) => (
                                        <div key={label} className="grid grid-cols-2 border-b border-[#DCDCDC]/20 pb-2">
                                            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{label}</span>
                                            <span className="text-[12px] font-bold text-slate-900 tracking-tight uppercase">{val || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full" />
                                    Verification Assets
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Asset Photo', url: selectedRequest.photoUrl },
                                        { label: 'Aadhaar Core', url: selectedRequest.aadhaarImage },
                                        { label: 'PAN Archive', url: selectedRequest.panImage },
                                    ].map((doc) => (
                                        <div key={doc.label} className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{doc.label}</p>
                                            <div className="aspect-[4/3] bg-[#F5F5F5] rounded-2xl border border-[#DCDCDC] overflow-hidden flex items-center justify-center p-1 shadow-inner group">
                                                {doc.url ? (
                                                    <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                                                        <img src={getFileUrl(doc.url)} alt={doc.label} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
                                                    </a>
                                                ) : <span className="text-[8px] font-black text-slate-300">NULL_PTR</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-8 mt-4 border-t border-[#DCDCDC]/40">
                            <button
                                onClick={() => handleApproveJoining(selectedRequest._id)}
                                className="flex-1 py-4 bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white font-black rounded-xl text-[11px] uppercase tracking-[0.2em] shadow-lg hover:shadow-[#C46A2D]/20 active:scale-95 transition-all"
                            >
                                Authorize Entry
                            </button>
                            <button
                                onClick={() => handleRejectJoining(selectedRequest._id)}
                                className="flex-1 py-4 bg-white text-slate-400 hover:text-[#B23A48] font-black rounded-xl text-[11px] uppercase tracking-[0.2em] border border-[#DCDCDC] hover:border-[#B23A48]/20 transition-all"
                            >
                                Deny Intake
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Salary Modal */}
            <Modal isOpen={showSalaryModal} onClose={() => setShowSalaryModal(false)} title="Salary Structure" maxWidth="max-w-md">
                <form onSubmit={handleSalaryUpdate} className="space-y-6 p-8">
                    <div className="flex items-center gap-5 border-b border-[#DCDCDC]/40 pb-6">
                        <div className="w-16 h-16 bg-white border border-[#DCDCDC] rounded-2xl flex items-center justify-center text-[#C46A2D] text-2xl font-black shadow-inner">
                            {selectedEmployee?.fullName?.[0]}
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">{selectedEmployee?.fullName}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full" /> Financial Configuration
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Rate / Day (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-[#C46A2D] transition-colors">₹</span>
                                <input type="number" value={salaryForm.baseRate} onChange={e => setSalaryForm({ ...salaryForm, baseRate: Number(e.target.value) })}
                                    className="w-full h-[48px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl pl-10 pr-4 text-sm text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#C46A2D]/5 focus:border-[#C46A2D] outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conveyance (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-[#C46A2D] transition-colors">₹</span>
                                <input type="number" value={salaryForm.conveyance} onChange={e => setSalaryForm({ ...salaryForm, conveyance: Number(e.target.value) })}
                                    className="w-full h-[48px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl pl-10 pr-4 text-sm text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#C46A2D]/5 focus:border-[#C46A2D] outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incentive Unit (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-[#C46A2D] transition-colors">₹</span>
                                <input type="number" value={salaryForm.incentiveRate} onChange={e => setSalaryForm({ ...salaryForm, incentiveRate: Number(e.target.value) })}
                                    className="w-full h-[48px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl pl-10 pr-4 text-sm text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#C46A2D]/5 focus:border-[#C46A2D] outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TDS Factor (%)</label>
                            <div className="relative group">
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-[#B23A48] transition-colors">%</span>
                                <input type="number" value={salaryForm.tdsRate} onChange={e => setSalaryForm({ ...salaryForm, tdsRate: Number(e.target.value) })}
                                    className="w-full h-[48px] bg-[#F5F5F5] border border-[#DCDCDC] rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#B23A48]/5 focus:border-[#B23A48] outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-white border border-[#DCDCDC] rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sync Logic</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                            NET = [(BASE × DAYS) + (UNITS × INCENTIVE) + ALLW] - [TDS + ADV]
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white font-black rounded-xl hover:shadow-xl hover:shadow-[#C46A2D]/20 transition-all cursor-pointer shadow-lg uppercase text-[11px] tracking-[0.2em] active:scale-95"
                    >
                        Apply Financial Delta
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default EmployeeList;
