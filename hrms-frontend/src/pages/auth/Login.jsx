import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineShieldCheck,
    HiOutlineUpload,
    HiOutlineUserAdd,
    HiOutlineChevronRight
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'joining'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Login State
    const [loginData, setLoginData] = useState({ employeeId: '', password: '' });

    // Joining State (Pending Approval)
    // Joining State (Pending Approval)
    const [joiningData, setJoiningData] = useState({
        // Personal
        fullName: '',
        fatherName: '',
        partnerName: '',
        mobile: '',
        dob: '',
        gender: 'Male',
        address: '',
        hubName: '',

        // Identity
        aadhaar: '',
        pan: '',

        // Bank
        accountName: '',
        accountNumber: '',
        ifscCode: '',

        // Internal
        email: '',
        profileId: '',
        officeLocation: ''
    });
    const [files, setFiles] = useState({ photo: null, aadhaarImage: null, aadhaarBackImage: null, panImage: null });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(loginData.employeeId, loginData.password);
            toast.success(`Access Granted. Welcome, ${user.fullName}`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Authentication Failed';
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };



    const handleJoining = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        Object.keys(joiningData).forEach(key => formData.append(key, joiningData[key]));
        if (files.photo) formData.append('photo', files.photo);
        if (files.aadhaarImage) formData.append('aadhaarImage', files.aadhaarImage);
        if (files.aadhaarBackImage) formData.append('aadhaarBackImage', files.aadhaarBackImage);
        if (files.panImage) formData.append('panImage', files.panImage);

        try {
            await authAPI.newJoining(formData);
            const msg = 'Onboarding Request Transmitted Successfully.';
            setSuccessMsg(msg);
            toast.success(msg);
            setMode('login');
        } catch (err) {
            console.error('Joining Request Error:', err.response); // Log full error for debugging
            const errMsg = err.response?.data?.error || 'Submission failed. Please check your inputs.';
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };

    const handleFileChange = (e, field) => {
        if (e.target.files[0]) setFiles({ ...files, [field]: e.target.files[0] });
    };

    const inputClasses = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 text-sm font-medium hover:border-emerald-300";
    const labelClasses = "text-xs font-semibold text-gray-500 ml-1 mb-1.5 block";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                    <motion.div
                        className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg p-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    >
                        <img src={logo} alt="Angle Courier Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                        Angle Courier
                    </h1>
                    <p className="text-emerald-100 text-xs font-medium tracking-wide uppercase opacity-90">Personnel Logistics Portal</p>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-xs font-bold text-center">
                                {successMsg}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className={labelClasses}>Employee Identifier</label>
                                    <div className="relative group">
                                        <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input type="text" value={loginData.employeeId} onChange={e => setLoginData({ ...loginData, employeeId: e.target.value })} placeholder="EX: EMP-001" className={`${inputClasses} pl-11`} required />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Secure Access Key</label>
                                    <div className="relative group">
                                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} placeholder="••••••••" className={`${inputClasses} pl-11`} required />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                                >
                                    {isLoading ? 'Processing...' : 'Secure Login'}
                                    {!isLoading && <HiOutlineChevronRight className="w-4 h-4" />}
                                </motion.button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setMode('joining')}
                                        className="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineUserAdd className="w-5 h-5" />
                                        New Employee Onboarding Form
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {mode === 'joining' && (
                            <motion.form
                                key="joining"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleJoining}
                                className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
                            >
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Personal Details</h3>
                                        <div className="space-y-4">
                                            <div><label className={labelClasses}>Full Name</label><input type="text" placeholder="As per Aadhaar" value={joiningData.fullName} onChange={e => setJoiningData({ ...joiningData, fullName: e.target.value })} className={inputClasses} required /></div>

                                            <div><label className={labelClasses}>Father's Name</label><input type="text" value={joiningData.fatherName} onChange={e => setJoiningData({ ...joiningData, fatherName: e.target.value })} className={inputClasses} /></div>
                                            <div><label className={labelClasses}>Husband/Partner Name</label><input type="text" value={joiningData.partnerName} onChange={e => setJoiningData({ ...joiningData, partnerName: e.target.value })} className={inputClasses} /></div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className={labelClasses}>Date of Birth</label><input type="date" value={joiningData.dob} onChange={e => setJoiningData({ ...joiningData, dob: e.target.value })} className={inputClasses} required /></div>
                                                <div>
                                                    <label className={labelClasses}>Gender</label>
                                                    <select value={joiningData.gender} onChange={e => setJoiningData({ ...joiningData, gender: e.target.value })} className={inputClasses}>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div><label className={labelClasses}>Residential Address</label><textarea rows="2" value={joiningData.address} onChange={e => setJoiningData({ ...joiningData, address: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>Hub Name (Optional)</label><input type="text" value={joiningData.hubName} onChange={e => setJoiningData({ ...joiningData, hubName: e.target.value })} className={inputClasses} /></div>

                                            <div><label className={labelClasses}>Mobile Number</label><input type="tel" maxLength="10" placeholder="10-digit Mobile" value={joiningData.mobile} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setJoiningData({ ...joiningData, mobile: val }) }} className={inputClasses} required pattern="[0-9]{10}" /></div>
                                            <div><label className={labelClasses}>Email Address</label><input type="email" placeholder="john@example.com" value={joiningData.email} onChange={e => setJoiningData({ ...joiningData, email: e.target.value })} className={inputClasses} /></div>
                                        </div>
                                    </div>

                                    {/* Identity Section */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Identity Proofs</h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className={labelClasses}>Pan Number</label><input type="text" style={{ textTransform: 'uppercase' }} placeholder="ABCDE1234F" value={joiningData.pan} onChange={e => setJoiningData({ ...joiningData, pan: e.target.value.toUpperCase() })} className={inputClasses} maxLength="10" required pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" title="Format: ABCDE1234F" /></div>
                                                <div><label className={labelClasses}>Aadhaar Number</label><input type="text" maxLength="12" placeholder="12-digit Aadhaar" value={joiningData.aadhaar} onChange={e => setJoiningData({ ...joiningData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} className={inputClasses} required pattern="[0-9]{12}" title="12-digit Aadhaar Number" /></div>
                                            </div>

                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-2">Upload Documents (Max 1MB)</p>
                                            {['photo', 'aadhaarImage', 'aadhaarBackImage', 'panImage'].map(key => (
                                                <div key={key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                                                    <span className="text-xs font-medium text-gray-600 capitalize">
                                                        {key === 'photo' ? 'Profile Photo' :
                                                            key === 'aadhaarImage' ? 'Aadhaar Front' :
                                                                key === 'aadhaarBackImage' ? 'Aadhaar Back' : 'PAN Card'}
                                                    </span>
                                                    <label className="text-[10px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 px-3 py-1.5 rounded-lg font-bold uppercase cursor-pointer transition-colors border border-gray-200">
                                                        {files[key] ? 'Selected' : 'Upload'}
                                                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, key)} className="hidden" />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bank Section */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Banking Details</h3>
                                        <div className="space-y-4">
                                            <div><label className={labelClasses}>Account Holder Name</label><input type="text" value={joiningData.accountName} onChange={e => setJoiningData({ ...joiningData, accountName: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>Account Number</label><input type="password" value={joiningData.accountNumber} onChange={e => setJoiningData({ ...joiningData, accountNumber: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>IFSC Code</label><input type="text" style={{ textTransform: 'uppercase' }} placeholder="SBIN000XXXX" value={joiningData.ifscCode} onChange={e => setJoiningData({ ...joiningData, ifscCode: e.target.value.toUpperCase() })} className={inputClasses} maxLength="11" required pattern="^[A-Z]{4}0[A-Z0-9]{6}$" title="Format: SBIN0001234" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 gap-3 flex flex-col">
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20"
                                    >
                                        {isLoading ? 'Processing...' : 'Submit Request'}
                                    </motion.button>
                                    <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 py-2">Cancel</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
