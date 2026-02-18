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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Employee Directory</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{employees.length} Active Employees</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {joiningRequests.length > 0 && (
                        <button onClick={() => setShowJoiningModal(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group">
                            <span className="w-2 h-2 bg-amber-500 rounded-full group-hover:scale-150 transition-transform" />
                            {joiningRequests.length} Pending Joining{joiningRequests.length > 1 ? 's' : ''}
                        </button>
                    )}
                    <button onClick={() => { setShowAddModal(true); setAddResult(null); setAddForm({ fullName: '', employeeId: '', mobile: '', designation: '', department: '', officeLocation: '', baseRate: '', conveyance: '', hubName: '', aadhaar: '', pan: '', email: '' }); }}
                        className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all cursor-pointer group">
                        <HiOutlinePlus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> Add Employee
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <form onSubmit={handleSearch} className="relative flex-1 group">
                    <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..."
                        className="w-full bg-white/50 border border-slate-200 rounded-[24px] pl-14 pr-6 py-4 text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none shadow-sm" />
                </form>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="bg-white/50 border border-slate-100 rounded-[32px] p-8 space-y-6">
                    <Skeleton className="w-1/4 h-6 mb-8" />
                    <ListSkeleton count={8} />
                </div>
            ) : (
                <div className="bg-white border border-slate-200/60 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Employee Name', 'Employee ID', 'Department', 'Documents', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-8 py-6">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300 group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-11 h-11 bg-white rounded-[18px] flex items-center justify-center text-xs font-black text-indigo-600 border border-slate-100 shadow-sm group-hover:shadow-indigo-500/10 group-hover:border-indigo-100 transition-all">
                                                    {emp.fullName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{emp.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{emp.designation || 'Specialist'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/50 px-3 py-1 rounded-full border border-slate-100">{emp.employeeId}</span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600 font-bold">{emp.department || 'General'}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2 items-center">
                                                <div className={`w-3 h-3 rounded-full border-2 ${emp.aadhaar ? 'bg-emerald-500 border-white shadow-sm shadow-emerald-500/20' : 'bg-rose-100 border-rose-200'}`} title="Aadhaar" />
                                                <div className={`w-3 h-3 rounded-full border-2 ${emp.pan ? 'bg-emerald-500 border-white shadow-sm shadow-emerald-500/20' : 'bg-rose-100 border-rose-200'}`} title="PAN" />
                                                <div className={`w-3 h-3 rounded-full border-2 ${emp.bankAccount ? 'bg-emerald-500 border-white shadow-sm shadow-emerald-500/20' : 'bg-rose-100 border-rose-200'}`} title="Bank" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border shadow-sm transition-all",
                                                emp.status === 'Active' ? 'text-emerald-700 bg-emerald-50/50 border-emerald-200 group-hover:bg-emerald-50' : 'text-slate-400 bg-slate-50 border-slate-200'
                                            )}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleView(emp)} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group/btn" title="View Profile">
                                                    <HiOutlineEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button onClick={() => handleSalaryConfig(emp)} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:shadow-lg hover:shadow-teal-500/10 transition-all cursor-pointer group/btn" title="Salary Config">
                                                    <HiOutlineCash className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button onClick={() => handleDelete(emp._id)} className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer group/btn" title="Delete Employee">
                                                    <HiOutlineTrash className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Operational Profile" maxWidth="max-w-xl">
                {selectedEmployee && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Personal Details
                            </h3>
                            {[
                                ['Full Name', selectedEmployee.fullName],
                                ['Employee ID', selectedEmployee.employeeId],
                                ['Mobile Number', selectedEmployee.mobile],
                                ['Email Address', selectedEmployee.email || 'N/A'],
                                ['Designation', selectedEmployee.designation || 'N/A'],
                                ['Department', selectedEmployee.department || 'N/A'],
                                ['Hub Name', selectedEmployee.hubName || 'N/A'],
                                ['Joining Date', new Date(selectedEmployee.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })],
                            ].map(([label, value]) => (
                                <div key={label} className="flex flex-col gap-0.5 group">
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{label}</span>
                                    <span className="text-sm text-slate-900 font-bold group-hover:text-emerald-600 transition-colors">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                Documents & Salary
                            </h3>
                            {[
                                ['Aadhaar Number', selectedEmployee.aadhaar ? selectedEmployee.aadhaar : 'AWAITING DATA', !!selectedEmployee.aadhaar],
                                ['PAN Card', selectedEmployee.pan ? selectedEmployee.pan : 'AWAITING DATA', !!selectedEmployee.pan],
                                ['Profile ID', selectedEmployee.profileId || 'N/A'],
                                ['Bank Account', selectedEmployee.bankAccount ? selectedEmployee.bankAccount : 'AWAITING DATA', !!selectedEmployee.bankAccount],
                                ['IFSC Code', selectedEmployee.ifscCode || 'N/A'],
                                ['Base Pay Rate', `₹${selectedEmployee.baseRate || 0}`],
                                ['Conveyance Allw.', `₹${selectedEmployee.conveyance || 0}`],
                                ['Employment Status', selectedEmployee.status],
                            ].map(([label, value, exists]) => (
                                <div key={label} className="flex flex-col gap-0.5 group">
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{label}</span>
                                    <span className={`text-sm font-bold ${exists === false ? 'text-rose-500 italic' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>{value}</span>
                                </div>
                            ))}
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
                            { key: 'employeeId', label: 'Employee ID *', type: 'text', required: true },
                            { key: 'mobile', label: 'Mobile Number *', type: 'tel', required: true },
                            { key: 'email', label: 'Email Address', type: 'email' },
                            { key: 'ehrId', label: 'EHR ID', type: 'text' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                    required={field.required} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'designation', label: 'Designation', type: 'text' },
                            { key: 'department', label: 'Department', type: 'text' },
                            { key: 'officeLocation', label: 'Office Location', type: 'text' },
                            { key: 'hubName', label: 'Hub Name', type: 'text' },
                            { key: 'profileId', label: 'Profile ID', type: 'text' },
                            { key: 'bankAccount', label: 'Bank Account', type: 'text' },
                            { key: 'ifscCode', label: 'IFSC Code', type: 'text' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100">
                        {[
                            { key: 'baseRate', label: 'Base Rate (₹)', type: 'number' },
                            { key: 'conveyance', label: 'Conveyance (₹)', type: 'number' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">{field.label}</label>
                                <input type={field.type} value={addForm[field.key]} onChange={(e) => setAddForm({ ...addForm, [field.key]: e.target.value })}
                                    className="w-full bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm" />
                            </div>
                        ))}
                    </div>
                    {addResult && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase text-center tracking-[0.1em] border ${addResult.success ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                            {addResult.msg}
                        </div>
                    )}
                    <button type="submit" disabled={addLoading}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 cursor-pointer shadow-xl shadow-slate-200 mt-2">
                        {addLoading ? 'ADDING EMPLOYEE...' : 'CONFIRM ADD EMPLOYEE'}
                    </button>
                </form>
            </Modal>

            {/* Joining Requests Modal */}
            <Modal isOpen={showJoiningModal} onClose={() => setShowJoiningModal(false)} title="Joining Requests" maxWidth={selectedRequest ? "max-w-4xl" : "max-w-2xl"}>
                {!selectedRequest ? (
                    // List View
                    <div className="grid gap-4 p-6">
                        {joiningRequests.map((req) => (
                            <motion.div
                                key={req._id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-slate-50 border border-slate-200 rounded-[28px] p-6 flex justify-between items-center hover:bg-white hover:shadow-xl hover:shadow-slate-200 transition-all cursor-pointer group"
                                onClick={() => setSelectedRequest(req)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm group-hover:rotate-3 transition-transform">
                                        {req.photoUrl ? (
                                            <img src={getFileUrl(req.photoUrl)} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black text-slate-300">{req.fullName[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{req.fullName}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-emerald-600 transition-colors">📱 {req.mobile} • <span className="text-slate-600">{req.hubName || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">PENDING APPROVAL</span>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tighter">{new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                </div>
                            </motion.div>
                        ))}
                        {joiningRequests.length === 0 && <p className="text-center text-slate-400 font-bold italic tracking-tight py-12 bg-slate-50 rounded-[40px] border border-dashed border-slate-300">No telemetry data for joining requests.</p>}
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
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Bio-Metric & Identity
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        ['LEGAL NAME', selectedRequest.fullName],
                                        ['FATHER NAME', selectedRequest.fatherName],
                                        ['PARTNER NAME', selectedRequest.partnerName],
                                        ['PROFILE ID', selectedRequest.profileId],
                                        ['BORN ON', selectedRequest.dob ? new Date(selectedRequest.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'],
                                        ['GENDER VECTOR', selectedRequest.gender],
                                        ['COMMUNICATION', selectedRequest.mobile],
                                        ['HUB ASSIGNMENT', selectedRequest.hubName],
                                        ['OFFICE SITE', selectedRequest.officeLocation],
                                        ['BANK ACCOUNT', selectedRequest.bankAccount],
                                        ['IFSC CODE', selectedRequest.ifscCode],
                                        ['CURRENT RESIDENCE', selectedRequest.address],
                                        ['AADHAAR REFERENCE', selectedRequest.aadhaar],
                                        ['PAN REFERENCE', selectedRequest.pan],
                                    ].map(([label, val]) => (
                                        <div key={label} className="grid grid-cols-2">
                                            <span className="text-[9px] font-black text-slate-400 tracking-tighter uppercase">{label}</span>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">{val || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                    Validation Documents
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Asset Photo', url: selectedRequest.photoUrl },
                                        { label: 'Aadhaar Matrix', url: selectedRequest.aadhaarImage },
                                        { label: 'PAN Register', url: selectedRequest.panImage },
                                    ].map((doc) => (
                                        <div key={doc.label} className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{doc.label}</p>
                                            <div className="aspect-[4/3] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-inner group">
                                                {doc.url ? (
                                                    <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                                                        <img src={getFileUrl(doc.url)} alt={doc.label} className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                                                    </a>
                                                ) : <span className="text-[10px] font-black text-slate-300">MISSING_DATA</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleApproveJoining(selectedRequest._id)}
                                className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-[24px] text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-slate-900 transition-all"
                            >
                                Authorize Entry
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRejectJoining(selectedRequest._id)}
                                className="flex-1 py-5 bg-white text-slate-400 hover:text-rose-600 font-black rounded-[24px] text-xs uppercase tracking-[0.2em] border border-slate-200 hover:border-rose-200 transition-all"
                            >
                                Deny Intake
                            </motion.button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Salary Modal */}
            <Modal isOpen={showSalaryModal} onClose={() => setShowSalaryModal(false)} title="Salary Structure" maxWidth="max-w-md">
                <form onSubmit={handleSalaryUpdate} className="space-y-6 p-6">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                            {selectedEmployee?.fullName?.[0]}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{selectedEmployee?.fullName}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Compensation</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Base Rate (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-emerald-500 transition-colors">₹</span>
                                <input type="number" value={salaryForm.baseRate} onChange={e => setSalaryForm({ ...salaryForm, baseRate: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm text-slate-900 font-extrabold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Conveyance (₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-emerald-500 transition-colors">₹</span>
                                <input type="number" value={salaryForm.conveyance} onChange={e => setSalaryForm({ ...salaryForm, conveyance: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm text-slate-900 font-extrabold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Incentive Rate (Per Del. ₹)</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-emerald-500 transition-colors">₹</span>
                                <input type="number" value={salaryForm.incentiveRate} onChange={e => setSalaryForm({ ...salaryForm, incentiveRate: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm text-slate-900 font-extrabold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TDS Rate (%)</label>
                            <div className="relative group">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black group-focus-within:text-emerald-500 transition-colors">%</span>
                                <input type="number" value={salaryForm.tdsRate} onChange={e => setSalaryForm({ ...salaryForm, tdsRate: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-extrabold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner" required />
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-[28px] shadow-inner">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 opacity-60">Calculation Logic</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic tracking-tight">
                            Net Pay = [(Base Rate × Days) + (Deliveries × Incentive) + Allowances] - [TDS + Advances]
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl mt-2 hover:bg-emerald-600 transition-all cursor-pointer shadow-xl shadow-slate-200"
                    >
                        UPDATE SALARY CONFIG
                    </motion.button>
                </form>
            </Modal>
        </div>
    );
};

export default EmployeeList;
