import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineUserAdd,
    HiOutlineEye,
    HiOutlineEyeOff,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

// ─── Input Components ─────────────────────────────────────────────────────────
const PlainInput = ({ label, icon: Icon, value, onChange, type = 'text', placeholder, rightEl }) => (
    <div className="w-full">
        <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">{label}</label>
        <div className="relative flex items-center">
            <div className="absolute left-4 text-[#1B2B44] opacity-50 pointer-events-none">
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full bg-[#F7F8FA] border-2 border-slate-200 focus:border-[#1B2B44] focus:bg-white rounded-2xl py-4 pl-12 pr-12 text-[14px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300"
            />
            {rightEl && <div className="absolute right-4">{rightEl}</div>}
        </div>
    </div>
);

const RegularInput = ({ label, value, onChange, type = 'text', required }) => (
    <div className="space-y-1 mb-3 last:mb-0">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-black text-slate-900 focus:bg-white focus:border-[#1B2B44] outline-none transition-all placeholder:text-slate-300"
            placeholder={label}
        />
    </div>
);

const JoiningSection = ({ title, children }) => (
    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 mb-4">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{title}</h4>
        {children}
    </div>
);

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login = () => {
    const [mode, setMode] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    }, [user, navigate]);

    const [loginData, setLoginData] = useState({ fhrId: '', password: '' });
    const [joiningData, setJoiningData] = useState({
        fullName: '', fatherName: '', partnerName: '', mobile: '',
        dob: '', gender: 'Male', address: '', hubName: '',
        aadhaar: '', pan: '', accountName: '', accountNumber: '',
        ifscCode: '', email: '', profileId: '', officeLocation: ''
    });
    const [files, setFiles] = useState({ photo: null, aadhaarImage: null, aadhaarBackImage: null, panImage: null });

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const loggedInUser = await login(loginData.fhrId, loginData.password);
            toast.success(`Welcome, ${loggedInUser.fullName} 👋`);
            navigate(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }
        setIsLoading(false);
    };

    const handleJoining = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();
        Object.keys(joiningData).forEach(key => formData.append(key, joiningData[key]));
        if (!files.photo) {
            toast.error('Selfie photo is mandatory.');
            setIsLoading(false);
            return;
        }
        formData.append('photo', files.photo);
        if (files.aadhaarImage) formData.append('aadhaarImage', files.aadhaarImage);
        if (files.aadhaarBackImage) formData.append('aadhaarBackImage', files.aadhaarBackImage);
        if (files.panImage) formData.append('panImage', files.panImage);
        try {
            await authAPI.newJoining(formData);
            toast.success('Onboarding request submitted!');
            setMode('login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed');
        }
        setIsLoading(false);
    };

    const handleFileChange = (e, field) => {
        if (e.target.files[0]) setFiles({ ...files, [field]: e.target.files[0] });
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            style={{ backgroundColor: '#1B2B44' }}
        >
            {/* ── TOP: Compact Logo Section ──────────────────────────────────── */}
            <div className="flex flex-col items-center pt-6 pb-4">
                {/* Logo circle */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.30)' }}
                    className="w-28 h-28 rounded-full bg-white flex items-center justify-center p-4 border-2 border-white/20"
                >
                    <img src={logo} alt="Angle Courier Logo" className="w-full h-full object-contain" />
                </motion.div>
                {/* Brand text */}
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 text-center"
                >
                    <h1 className="text-xl font-black text-white tracking-widest uppercase opacity-90">Angle Courier Service</h1>
                </motion.div>
            </div>

            {/* ── BOTTOM: Compact Card Section ─ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col items-center"
            >
                <div className="w-full flex-1 flex flex-col">
                    <div
                        className="bg-white rounded-t-[32px] flex-1 px-6 pt-8 pb-10 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]"
                    >
                        <AnimatePresence mode="wait">

                            {/* LOGIN FORM */}
                            {mode === 'login' && (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onSubmit={handleLogin}
                                    className="space-y-5"
                                >
                                    <div className="mb-2">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                                        <p className="text-[11px] text-slate-500 font-semibold mt-1">
                                            Sign in to your employee account
                                        </p>
                                    </div>

                                    <PlainInput
                                        label="Employee ID"
                                        icon={HiOutlineIdentification}
                                        type="text"
                                        value={loginData.fhrId}
                                        onChange={v => setLoginData({ ...loginData, fhrId: v })}
                                        placeholder="123456"
                                    />

                                    <PlainInput
                                        label="Password"
                                        icon={HiOutlineLockClosed}
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginData.password}
                                        onChange={v => setLoginData({ ...loginData, password: v })}
                                        placeholder="••••••••"
                                        rightEl={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(s => !s)}
                                                className="text-slate-400 hover:text-slate-700 transition-colors"
                                            >
                                                {showPassword
                                                    ? <HiOutlineEyeOff className="w-4 h-4" />
                                                    : <HiOutlineEye className="w-4 h-4" />}
                                            </button>
                                        }
                                    />

                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 text-white font-black text-[13px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: '#1B2B44', boxShadow: '0 6px 20px rgba(27,43,68,0.25)' }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Verifying...
                                            </>
                                        ) : 'Login'}
                                    </motion.button>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-slate-100" />
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setMode('joining')}
                                        className="w-full py-3.5 border-2 border-slate-100 hover:border-[#1B2B44] rounded-2xl text-[11px] font-black text-slate-600 hover:text-[#1B2B44] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineUserAdd className="w-4 h-4" />
                                        New Joining Registration
                                    </button>

                                    <p className="text-center text-[11px] text-slate-500 font-semibold">
                                        <Link to="/auth/forgot-password" title="Recover Password">Forgot Password?</Link>{' '}
                                        <span className="text-[#1B2B44] font-black">Contact HR</span>
                                    </p>
                                </motion.form>
                            )}

                            {/* JOINING FORM */}
                            {mode === 'joining' && (
                                <motion.form
                                    key="joining"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onSubmit={handleJoining}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900">New Joining</h2>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Onboarding Request</p>
                                        </div>
                                        <div className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[8px] font-black text-emerald-600 uppercase">Live</div>
                                    </div>

                                    <div className="max-h-[380px] overflow-y-auto pr-1">
                                        <JoiningSection title="Personal Info">
                                            <RegularInput label="Full Name" value={joiningData.fullName}
                                                onChange={v => setJoiningData({ ...joiningData, fullName: v })} required />
                                            <RegularInput label="Mobile" type="tel" value={joiningData.mobile}
                                                onChange={v => setJoiningData({ ...joiningData, mobile: v.replace(/\D/g, '').slice(0, 10) })} required />
                                            <RegularInput label="Email" type="email" value={joiningData.email}
                                                onChange={v => setJoiningData({ ...joiningData, email: v })} required />
                                        </JoiningSection>

                                        <JoiningSection title="ID Documents">
                                            <RegularInput label="PAN Number" value={joiningData.pan}
                                                onChange={v => setJoiningData({ ...joiningData, pan: v.toUpperCase() })} required />
                                            <RegularInput label="Aadhaar Number" value={joiningData.aadhaar}
                                                onChange={v => setJoiningData({ ...joiningData, aadhaar: v.replace(/\D/g, '').slice(0, 12) })} required />
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {['photo', 'aadhaarImage', 'aadhaarBackImage', 'panImage'].map(key => (
                                                    <label key={key} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-tight mb-0.5 text-center">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase ${files[key] ? 'text-emerald-600' : 'text-[#1B2B44]'}`}>
                                                            {files[key] ? '✓ Done' : 'Upload'}
                                                        </span>
                                                        <input type="file" className="hidden"
                                                            onChange={e => handleFileChange(e, key)} accept="image/*" />
                                                    </label>
                                                ))}
                                            </div>
                                        </JoiningSection>

                                        <JoiningSection title="Bank Details">
                                            <RegularInput label="Account Holder Name" value={joiningData.accountName}
                                                onChange={v => setJoiningData({ ...joiningData, accountName: v })} required />
                                            <RegularInput label="Account Number" type="password" value={joiningData.accountNumber}
                                                onChange={v => setJoiningData({ ...joiningData, accountNumber: v })} required />
                                            <RegularInput label="IFSC Code" value={joiningData.ifscCode}
                                                onChange={v => setJoiningData({ ...joiningData, ifscCode: v.toUpperCase() })} required />
                                        </JoiningSection>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
                                        style={{ backgroundColor: '#1B2B44' }}
                                    >
                                        {isLoading
                                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                                            : 'Submit Application'}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className="w-full text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors py-3 uppercase tracking-widest cursor-pointer mt-1"
                                    >
                                        ← Back to Login
                                    </button>
                                </motion.form>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
