import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineChevronRight,
    HiOutlineKey
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

// --- SUB-COMPONENTS ---
const PremiumInput = ({ label, icon: Icon, value, onChange, type = "text", placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative group/input w-full mt-4 first:mt-0">
            <label className={cn(
                "absolute left-0 -top-8 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300",
                isFocused ? "text-indigo-600" : "text-slate-400"
            )}>
                {label}
            </label>
            <div className="relative flex items-center">
                <Icon className={cn(
                    "absolute left-0 w-7 h-7 transition-colors duration-300",
                    isFocused ? "text-indigo-600" : "text-slate-200"
                )} />
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-b-2 border-slate-50 pt-6 pb-4 pl-12 text-[17px] font-bold text-slate-900 placeholder:text-slate-100 outline-none hover:border-slate-100 transition-all duration-300"
                    placeholder={placeholder}
                    required
                />
                <motion.div
                    initial={false}
                    animate={{ width: isFocused ? '100%' : '0%' }}
                    className="absolute bottom-0 left-0 h-[3px] bg-indigo-600 shadow-lg shadow-indigo-100"
                />
            </div>
        </div>
    );
};

const RegularInput = ({ label, value, onChange, type = "text", required }) => (
    <div className="space-y-2 mb-4 last:mb-0">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[13px] font-bold text-slate-900 focus:bg-white focus:border-indigo-400/50 outline-none transition-all placeholder:text-slate-200"
            placeholder={label}
        />
    </div>
);

// --- MAIN COMPONENT ---
const AdminLogin = () => {
    console.log("AdminLogin Rendering...");
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in as admin
    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

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
            const loggedInUser = await login(loginData.employeeId, loginData.password);
            if (loggedInUser.role !== 'admin') {
                setError('ACCESS DENIED: Insufficient Clearance Level.');
                toast.error('ACCESS DENIED: Insufficient Clearance Level.');
                setIsLoading(false);
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
            const msg = `Admin Induction Success. ID: ${res.data.employeeId}. Proceed to Login.`;
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

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-6 bg-white">
            {/* PREMIUM AURA MESH BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#F9FAFF]" />

                {/* Aura 1 - Indigo Mesh */}
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.25, 1]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] right-[-10%] w-[80%] h-[80%] bg-indigo-100/40 rounded-full blur-[110px]"
                />

                {/* Aura 2 - Violet Mesh */}
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-violet-100/30 rounded-full blur-[130px]"
                />
            </div>

            {/* CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
                {/* LOGO TREATMENT */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <div className="relative w-[140px] h-[140px] flex items-center justify-center rounded-[48px] bg-white shadow-xl border border-white p-7 transition-all duration-500">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                        <motion.div
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/50 to-transparent skew-x-[-25deg]"
                        />
                    </div>
                </motion.div>

                {/* BRANDING */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 tracking-[-0.04em] leading-none mb-1 uppercase text-center block w-full">
                        ANGLE <span className="text-indigo-600">ADMIN</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.45em]">Security & Governance</p>
                </div>

                {/* LOGIN CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-white/95 backdrop-blur-2xl rounded-[44px] shadow-2xl border border-white p-8 pt-10 relative"
                >
                    {/* Header Tabs */}
                    <div className="flex bg-slate-50/80 p-1.5 rounded-[22px] mb-10 border border-slate-100">
                        {['login', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-500 border-none cursor-pointer",
                                    mode === m ? "bg-white text-indigo-700 shadow-xl" : "text-slate-400 hover:text-slate-600 outline-none"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                onSubmit={handleLogin}
                                className="space-y-10"
                            >
                                <div className="space-y-12">
                                    <PremiumInput
                                        label="Admin Identifier"
                                        icon={HiOutlineIdentification}
                                        value={loginData.employeeId}
                                        onChange={v => setLoginData({ ...loginData, employeeId: v })}
                                        placeholder="EX: ADMIN-01"
                                    />
                                    <PremiumInput
                                        label="Secure Key"
                                        icon={HiOutlineLockClosed}
                                        type="password"
                                        value={loginData.password}
                                        onChange={v => setLoginData({ ...loginData, password: v })}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full relative group/btn h-[68px] bg-slate-900 rounded-[24px] shadow-xl transition-all duration-300 flex items-center justify-center border-none cursor-pointer overflow-hidden mt-6"
                                    disabled={isLoading}
                                >
                                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 text-[13px] font-black text-white uppercase tracking-[0.25em] block w-full text-center">{isLoading ? 'Authorizing...' : 'Secure Admin Login'}</span>
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/auth/login')}
                                    className="w-full text-center text-[10px] font-black text-slate-300 hover:text-indigo-500 transition-colors uppercase tracking-[0.3em] bg-transparent border-none cursor-pointer mt-4"
                                >
                                    Personnel Portal
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleRegister}
                                className="space-y-6 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar"
                            >
                                <div className="space-y-6">
                                    <RegularInput label="Induction Name" value={registerData.fullName} onChange={v => setRegisterData({ ...registerData, fullName: v })} required />
                                    <RegularInput label="Gov Mobile" type="tel" value={registerData.mobile} onChange={v => setRegisterData({ ...registerData, mobile: v })} required />
                                    <RegularInput label="Admin Email" type="email" value={registerData.email} onChange={v => setRegisterData({ ...registerData, email: v })} required />
                                    <RegularInput label="Secure Pass" type="password" value={registerData.password} onChange={v => setRegisterData({ ...registerData, password: v })} required />

                                    <div className="pt-8 border-t border-slate-50 space-y-3">
                                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                            <HiOutlineKey className="w-4 h-4" />
                                            Master Secret protocol
                                        </label>
                                        <input
                                            type="password"
                                            value={registerData.adminSecret}
                                            onChange={e => setRegisterData({ ...registerData, adminSecret: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none transition-all placeholder:text-slate-200"
                                            placeholder="Secret Required"
                                            required
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl border-none cursor-pointer mt-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Authorizing...' : 'Establish Admin Unit'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="mt-12 text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] opacity-80">
                    Governance Node • Authorized Personnel Only
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
