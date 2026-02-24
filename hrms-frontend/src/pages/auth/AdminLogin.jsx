import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineUserAdd,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineExclamation,
    HiOutlineKey,
    HiOutlineTerminal
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

// ─── Floating Label Input (Premium Light) ─────────────────────────────────────────
const FloatingInput = ({ label, icon: Icon, value, onChange, type = 'text', placeholder, rightEl, id }) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const isFloating = focused || hasValue;

    return (
        <div className="relative w-full">
            <div className="relative group">
                <label
                    htmlFor={id}
                    className={`absolute left-11 transition-all duration-200 pointer-events-none z-10 ${isFloating
                            ? 'top-2 text-[10px] font-bold text-[#C46A2D] uppercase tracking-wider'
                            : 'top-1/2 -translate-y-1/2 text-[14px] font-medium text-slate-400'
                        }`}
                >
                    {isFloating ? label : placeholder}
                </label>

                <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-200 ${focused ? 'text-[#C46A2D]' : 'text-slate-400'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`w-full h-14 bg-slate-50 border rounded-2xl pl-11 pr-11 pb-1 pt-5 text-[14px] font-bold text-slate-800 outline-none transition-all duration-300 placeholder-transparent ${focused
                            ? 'border-[#C46A2D]/40 bg-white ring-4 ring-[#C46A2D]/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    placeholder=" "
                />

                {rightEl && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        {rightEl}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Regular Input for Register Form ──────────────────────────────────────────
const DarkInput = ({ label, value, onChange, type = 'text', required }) => (
    <div className="space-y-1 mb-3 last:mb-0">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[13px] font-bold text-slate-800 focus:bg-white focus:border-[#C46A2D]/40 focus:ring-4 focus:ring-[#C46A2D]/5 outline-none transition-all"
            placeholder={label}
        />
    </div>
);

// ─── Main Admin Login Component ───────────────────────────────────────────────
const AdminLogin = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    // States
    const [loginData, setLoginData] = useState({ employeeId: '', password: '' });
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
            setError(err.response?.data?.error || 'Authorization Failed');
        }
        setIsLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await authAPI.adminRegister(registerData);
            toast.success(`Admin Induction Success. ID: ${res.data.employeeId}`);
            setMode('login');
            setLoginData({ employeeId: res.data.employeeId, password: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Induction failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#FDFDFD] flex flex-col lg:flex-row overflow-hidden">

            {/* ─── LEFT SIDE: Login Form (100% on mobile, 40% on desktop) ───── */}
            <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col relative z-20 bg-white">

                {/* Background Accents (Mobile only) */}
                <div className="fixed lg:hidden inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="flex-1 flex flex-col px-6 lg:px-12 py-10 overflow-y-auto scrollbar-hide">

                    {/* Header: Logo & Branding */}
                    <div className="mb-12 flex flex-col items-center lg:items-start">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-[#C46A2D]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                            <div className="relative w-16 h-16 rounded-2xl bg-white shadow-2xl shadow-slate-200/50 flex items-center justify-center p-3 border border-slate-50">
                                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </motion.div>

                        <div className="mt-6 text-center lg:text-left">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ANGLE ADMIN</h1>
                            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C46A2D] mt-1.5 opacity-80">
                                Global Governance Node
                            </p>
                        </div>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex bg-slate-50 p-1 rounded-2xl mb-8 border border-slate-100 self-center lg:self-start w-full max-w-[280px]">
                        {['login', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3"
                            >
                                <HiOutlineExclamation className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                <div className="mb-4">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Login</h2>
                                    <p className="text-[14px] text-slate-500 font-medium mt-1">Authorized personnel restricted access.</p>
                                </div>

                                <FloatingInput
                                    id="employeeId"
                                    label="Admin Identifier"
                                    icon={HiOutlineIdentification}
                                    value={loginData.employeeId}
                                    onChange={v => { setLoginData({ ...loginData, employeeId: v }); setError(''); }}
                                    placeholder="ADMIN-XXXX"
                                />

                                <FloatingInput
                                    id="password"
                                    label="Secure Key"
                                    icon={HiOutlineLockClosed}
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginData.password}
                                    onChange={v => { setLoginData({ ...loginData, password: v }); setError(''); }}
                                    placeholder="••••••••"
                                    rightEl={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(s => !s)}
                                            className="text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                        </button>
                                    }
                                />

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-slate-900 text-white font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-3 pt-1"
                                >
                                    {isLoading ? 'Establishing...' : 'Execute Admin Login'}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/auth/login')}
                                    className="w-full text-center text-[10px] font-black text-slate-300 hover:text-[#C46A2D] transition-colors uppercase tracking-[0.3em] mt-2"
                                >
                                    Personnel Portal
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Induction</h2>
                                    <p className="text-[11px] text-[#C46A2D] font-bold uppercase tracking-widest">Protocol Registration</p>
                                </div>

                                <div className="space-y-3">
                                    <DarkInput label="Full Name" value={registerData.fullName} onChange={v => setRegisterData({ ...registerData, fullName: v })} required />
                                    <div className="grid grid-cols-2 gap-3">
                                        <DarkInput label="Mobile" type="tel" value={registerData.mobile} onChange={v => setRegisterData({ ...registerData, mobile: v })} required />
                                        <DarkInput label="Admin Email" type="email" value={registerData.email} onChange={v => setRegisterData({ ...registerData, email: v })} required />
                                    </div>
                                    <DarkInput label="Secure Pass" type="password" value={registerData.password} onChange={v => setRegisterData({ ...registerData, password: v })} required />

                                    <div className="pt-4 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-[#8A6E3C] uppercase tracking-[0.2em] pl-1 flex items-center gap-2 mb-3">
                                            <HiOutlineKey className="w-5 h-5" />
                                            Master Secret Protocol
                                        </label>
                                        <input
                                            type="password"
                                            value={registerData.adminSecret}
                                            onChange={e => setRegisterData({ ...registerData, adminSecret: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[13px] font-bold text-slate-800 focus:bg-white focus:border-[#C46A2D]/40 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Secret Required"
                                            required
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-slate-900 text-white font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {isLoading ? 'Inducting...' : 'Establish Admin Unit'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Footer for Left Side */}
                    <div className="mt-auto pt-10 text-center lg:text-left">
                        <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">
                            © 2026 Angle Courier & Logistics Pvt Ltd
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT SIDE: Hero Image (Desktop only) ─────────────────────── */}
            <div className="hidden lg:block flex-1 relative bg-slate-100">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    alt="Modern Office"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent pointer-events-none" />

                {/* Corporate Mantra Text */}
                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="max-w-md"
                    >
                        <div className="flex items-center gap-2 text-white/60 mb-4">
                            <HiOutlineTerminal className="w-5 h-5" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase">Control System V2.4</span>
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tighter">
                            Managing the future of <span className="text-white/40">logistics.</span>
                        </h2>
                        <div className="mt-8 flex gap-4">
                            <div className="w-12 h-1 bg-white/20 rounded-full" />
                            <div className="w-8 h-1 bg-white/40 rounded-full" />
                            <div className="w-4 h-1 bg-[#C46A2D] rounded-full" />
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default AdminLogin;
