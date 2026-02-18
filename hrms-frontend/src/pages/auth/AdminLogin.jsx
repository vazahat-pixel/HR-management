import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineShieldCheck,
    HiOutlineChevronRight,
    HiOutlineKey
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

import logo from '../../assets/logo.png';

const AdminLogin = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Login State
    const [loginData, setLoginData] = useState({ employeeId: '', password: '' });

    // Register State (Admin Only)
    const [registerData, setRegisterData] = useState({
        fullName: '', mobile: '', email: '', password: '', adminSecret: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(loginData.employeeId, loginData.password);
            if (user.role !== 'admin') {
                setError('ACCESS DENIED: Insufficient Clearance Level.');
                return;
            }
            toast.success('Admin Session Established.');
            navigate('/admin/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Authorization Failed';
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await authAPI.adminRegister(registerData);
            const msg = `Admin Induction Success. Unit ID: ${res.data.employeeId}. Proceed to Login.`;
            setSuccessMsg(msg);
            toast.success(msg);
            setMode('login');
            setLoginData({ employeeId: res.data.employeeId, password: '' });
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Induction failed';
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 text-sm font-medium hover:border-emerald-300";
    const labelClasses = "text-xs font-semibold text-slate-500 ml-1 mb-1.5 block";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
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
                    <p className="text-emerald-100 text-xs font-medium tracking-wide uppercase opacity-90">Administration Portal</p>
                </div>

                <div className="p-8">
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                        {['login', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={cn(
                                    "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                                    mode === m ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

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
                                    <label className={labelClasses}>Administrator Identifier</label>
                                    <div className="relative group">
                                        <HiOutlineIdentification className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input type="text" value={loginData.employeeId} onChange={e => setLoginData({ ...loginData, employeeId: e.target.value })} placeholder="EX: ADMIN-001" className={`${inputClasses} pl-11`} required />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Secure Access Key</label>
                                    <div className="relative group">
                                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} placeholder="••••••••" className={`${inputClasses} pl-11`} required />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                                >
                                    {isLoading ? 'Decrypting...' : 'Secure Admin Login'}
                                    {!isLoading && <HiOutlineChevronRight className="w-4 h-4 text-white" />}
                                </motion.button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/auth/login')}
                                        className="text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
                                    >
                                        Return to Employee Portal
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {mode === 'register' && (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleRegister}
                                className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
                            >
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Admin Induction</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClasses}>Full Legal Name</label>
                                            <input type="text" placeholder="John Doe" value={registerData.fullName} onChange={e => setRegisterData({ ...registerData, fullName: e.target.value })} className={inputClasses} required />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Mobile Number</label>
                                            <input type="tel" placeholder="+91 99999 00000" value={registerData.mobile} onChange={e => setRegisterData({ ...registerData, mobile: e.target.value })} className={inputClasses} required />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Email Address</label>
                                            <input type="email" placeholder="admin@example.com" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} className={inputClasses} required />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Password</label>
                                            <input type="password" placeholder="Min 8 chars" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} className={inputClasses} required />
                                        </div>
                                        <div>
                                            <label className={`${labelClasses} text-emerald-600`}>Master Secret Key</label>
                                            <div className="relative group">
                                                <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                <input type="password" placeholder="••••••••" value={registerData.adminSecret} onChange={e => setRegisterData({ ...registerData, adminSecret: e.target.value })} className={`${inputClasses} pl-10 border-emerald-200 bg-emerald-50/50 focus:border-emerald-500`} required />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 mt-2"
                                >
                                    {isLoading ? 'Processing...' : 'Authorize Induction'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
