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
        <div className="relative group/input w-full">
            <label className="block text-[10px] font-black text-[#1B2B44] uppercase tracking-widest mb-2.5 ml-1">
                {label}
            </label>
            <div className="relative flex items-center">
                <div className={cn(
                    "absolute left-4 w-5 h-5 transition-colors duration-300 z-10",
                    isFocused ? "text-[#00D2FF]" : "text-[#1B2B44]/30"
                )}>
                    <Icon className="w-full h-full" />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "w-full bg-[#F1F3F6] border rounded-[18px] py-4 pl-12 pr-4 text-[14px] font-bold text-[#1B2B44] placeholder:text-slate-400 outline-none transition-all duration-500",
                        isFocused ? "border-[#00D2FF] bg-white shadow-[0_0_20px_rgba(0,210,255,0.08)]" : "border-slate-100"
                    )}
                    placeholder={placeholder}
                    required
                />
            </div>
        </div>
    );
};
const RegularInput = ({ label, value, onChange, type = "text", required }) => (
    <div className="space-y-2 mb-4 last:mb-0">
        <label className="text-[10px] font-black text-[#1B2B44] uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full bg-[#F1F3F6] border border-slate-100 rounded-[18px] px-6 py-4 text-[13px] font-bold text-[#1B2B44] focus:bg-white focus:border-[#00D2FF]/50 outline-none transition-all placeholder:text-slate-300"
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
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[#EBE9E4]">
            {/* LUXURY BACKGROUND ACCENTS */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M -100 500 Q 200 200 500 500 T 1100 500"
                            fill="none"
                            stroke="url(#goldGradient)"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <motion.path
                            d="M -100 600 Q 300 400 600 600 T 1100 600"
                            fill="none"
                            stroke="url(#goldGradient)"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 5, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <defs>
                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C46A2D" stopOpacity="0" />
                                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#C46A2D" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)]" />
            </div>

            {/* CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
                {/* LOGO TREATMENT */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 relative"
                >
                    <div className="relative w-[120px] h-[120px] rounded-full p-1 bg-gradient-to-tr from-[#8A6E3C] via-[#D4AF37] to-[#8A6E3C] shadow-[0_10px_40px_rgba(138,110,60,0.3)]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-4 overflow-hidden relative border border-white/50">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-[length:10px_10px]" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-[-10px] rounded-full border border-white/30 blur-[2px] opacity-50" />
                </motion.div>

                {/* BRANDING */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#1B2B44] tracking-[0.05em] leading-none mb-2 uppercase text-center block w-full">
                        ANGLE <span className="text-[#8A6E3C]">ADMIN</span>
                    </h1>
                    <p className="text-[10px] font-bold text-[#1B2B44] opacity-60 uppercase tracking-[0.5em]">GOVERNANCE NODE</p>
                </div>

                {/* LOGIN CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-white/60 backdrop-blur-3xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white/80 p-9 pt-10 relative"
                >
                    {/* Header Tabs */}
                    <div className="flex bg-[#F1F3F6]/80 p-1.5 rounded-[22px] mb-10 border border-slate-100">
                        {['login', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-500 border-none cursor-pointer",
                                    mode === m ? "bg-white text-[#1B2B44] shadow-xl" : "text-slate-400 hover:text-slate-600 outline-none"
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

                                <div className="pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 210, 255, 0.3)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full h-15 bg-gradient-to-r from-[#00D2FF] via-[#0072FF] to-[#00D2FF] bg-[length:200%_auto] hover:bg-[100%_center] rounded-[20px] text-[13px] font-black text-white uppercase tracking-widest shadow-[0_10px_20px_rgba(0,114,255,0.2)] transition-all duration-500 flex items-center justify-center relative overflow-hidden group/loginbtn"
                                        disabled={isLoading}
                                    >
                                        <span className="relative z-10">{isLoading ? 'ESTABLISHING...' : 'SECURE ADMIN LOGIN'}</span>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-[#00D2FF]/60 blur-[20px] opacity-0 group-hover/loginbtn:opacity-100 transition-opacity" />
                                    </motion.button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate('/auth/login')}
                                    className="w-full text-center text-[10px] font-black text-slate-300 hover:text-[#C46A2D] transition-colors uppercase tracking-[0.3em] bg-transparent border-none cursor-pointer mt-4"
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

                                    <div className="pt-8 border-t border-slate-100 space-y-4">
                                        <label className="text-[10px] font-black text-[#8A6E3C] uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                            <HiOutlineKey className="w-5 h-5" />
                                            Master Secret Protocol
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="password"
                                                value={registerData.adminSecret}
                                                onChange={e => setRegisterData({ ...registerData, adminSecret: e.target.value })}
                                                className="w-full bg-[#F1F3F6] border border-slate-100 rounded-[18px] px-6 py-4.5 text-[14px] font-bold text-[#1B2B44] focus:bg-white focus:border-[#00D2FF]/50 outline-none transition-all placeholder:text-slate-300"
                                                placeholder="Secret Required"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 210, 255, 0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-16 bg-gradient-to-r from-[#00D2FF] via-[#0072FF] to-[#00D2FF] bg-[length:200%_auto] hover:bg-[100%_center] rounded-[22px] text-[13px] font-black text-white uppercase tracking-widest shadow-[0_10px_20px_rgba(0,114,255,0.2)] transition-all duration-500 flex items-center justify-center relative overflow-hidden group/regbtn"
                                    disabled={isLoading}
                                >
                                    <span className="relative z-10">{isLoading ? 'ESTABLISHING...' : 'ESTABLISH ADMIN UNIT'}</span>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-[#00D2FF]/60 blur-[20px] opacity-0 group-hover/regbtn:opacity-100 transition-opacity" />
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="mt-12 text-[10px] font-black text-[#1B2B44]/30 uppercase tracking-[0.5em] text-center">
                    GOVERNANCE NODE • AUTHORIZED PERSONNEL ONLY
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
