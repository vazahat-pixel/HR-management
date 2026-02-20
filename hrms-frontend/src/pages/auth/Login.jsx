import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineLockClosed,
    HiOutlineIdentification,
    HiOutlineChevronRight,
    HiOutlineUserAdd,
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
    <div className="space-y-1.5 mb-4 last:mb-0">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-black text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
            placeholder={label}
        />
    </div>
);

const JoiningSection = ({ title, children }) => (
    <div className="bg-slate-50/50 rounded-[24px] p-5 border border-slate-100 mb-6 shadow-sm">
        <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-3 h-0.5 bg-slate-900/10 rounded-full" />
            {title}
        </h4>
        {children}
    </div>
);

// --- MAIN COMPONENT ---
const Login = () => {
    console.log("Login Rendering...");
    const [mode, setMode] = useState('login'); // 'login' | 'joining'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
        }
    }, [user, navigate]);

    // Login State
    const [loginData, setLoginData] = useState({ fhrId: '', password: '' });

    // Joining State (Pending Approval)
    const [joiningData, setJoiningData] = useState({
        fullName: '', fatherName: '', partnerName: '', mobile: '',
        dob: '', gender: 'Male', address: '', hubName: '',
        aadhaar: '', pan: '', accountName: '', accountNumber: '',
        ifscCode: '', email: '', profileId: '', officeLocation: ''
    });
    const [files, setFiles] = useState({ photo: null, aadhaarImage: null, aadhaarBackImage: null, panImage: null });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const loggedInUser = await login(loginData.fhrId, loginData.password);
            toast.success(`Access Granted. Welcome, ${loggedInUser.fullName}`);
            navigate(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
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
        else {
            toast.error('Selfie photo is mandatory for induction.');
            setIsLoading(false);
            return;
        }
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
            const errMsg = err.response?.data?.error || 'Submission failed. Please check your inputs.';
            setError(errMsg);
            toast.error(errMsg);
        }
        setIsLoading(false);
    };

    const handleFileChange = (e, field) => {
        if (e.target.files[0]) setFiles({ ...files, [field]: e.target.files[0] });
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-[#EBE9E4] relative overflow-hidden">
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
                            {/* Diamond pattern shimmer inner effect */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-[length:10px_10px]" />
                            </div>
                        </div>
                    </div>
                    {/* Ring glow */}
                    <div className="absolute inset-[-10px] rounded-full border border-white/30 blur-[2px] opacity-50" />
                </motion.div>

                {/* BRANDING */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#1B2B44] tracking-[0.05em] leading-none mb-2 uppercase">
                        ANGLE COURIER
                    </h1>
                    <p className="text-[10px] font-bold text-[#1B2B44] opacity-60 uppercase tracking-[0.5em]">LOGISTICS INTELLIGENCE</p>
                </div>

                {/* LOGIN CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-white/60 backdrop-blur-3xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white/80 p-9 pt-10 relative"
                >
                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                onSubmit={handleLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-10">
                                    <PremiumInput
                                        label="Employee FHRID"
                                        icon={HiOutlineIdentification}
                                        value={loginData.fhrId}
                                        onChange={v => setLoginData({ ...loginData, fhrId: v })}
                                        placeholder="EX: FHR-2026-001"
                                    />
                                    <PremiumInput
                                        label="Secure access key"
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
                                        <span className="relative z-10">{isLoading ? 'ESTABLISHING...' : 'LOG IN CONNECTION'}</span>
                                        {/* Glow Flare */}
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-[#00D2FF]/60 blur-[20px] opacity-0 group-hover/loginbtn:opacity-100 transition-opacity" />
                                    </motion.button>
                                </div>

                                {/* JOINING HIGHLIGHT */}
                                <div className="pt-10 border-t border-[#1B2B44]/5 flex flex-col items-center gap-4">
                                    <p className="text-[10px] font-bold text-[#1B2B44]/40 uppercase tracking-widest text-center">NEED AN ACCOUNT?</p>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02, backgroundColor: '#F8F9FA' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setMode('joining')}
                                        className="w-full py-4 bg-[#F1F3F6] border border-slate-100 rounded-[20px] flex items-center justify-center gap-4 transition-all group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-[#1B2B44]/50 flex items-center justify-center shadow-sm">
                                            <HiOutlineUserAdd className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[12px] font-black text-[#1B2B44] uppercase tracking-wider leading-none">INDUCTION REGISTRY</p>
                                            <p className="text-[9px] font-bold text-[#1B2B44]/40 uppercase tracking-tighter mt-1">START ONBOARDING</p>
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="joining"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                onSubmit={handleJoining}
                                className="space-y-5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar"
                            >
                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 py-1 border-b border-slate-100">
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Digital Induction</h3>
                                    <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-800 uppercase tracking-tighter">Live</div>
                                </div>

                                <JoiningSection title="Legal Records">
                                    <RegularInput label="Full Legal Name" value={joiningData.fullName} onChange={v => setJoiningData({ ...joiningData, fullName: v })} required />
                                    <RegularInput label="Contact Mobile" type="tel" value={joiningData.mobile} onChange={v => setJoiningData({ ...joiningData, mobile: v.replace(/\D/g, '').slice(0, 10) })} required />
                                    <RegularInput label="Registry Email" type="email" value={joiningData.email} onChange={v => setJoiningData({ ...joiningData, email: v })} required />
                                </JoiningSection>

                                <JoiningSection title="Governance ID">
                                    <RegularInput label="PAN Identifier" value={joiningData.pan} onChange={v => setJoiningData({ ...joiningData, pan: v.toUpperCase() })} required />
                                    <RegularInput label="Aadhaar ID" value={joiningData.aadhaar} onChange={v => setJoiningData({ ...joiningData, aadhaar: v.replace(/\D/g, '').slice(0, 12) })} required />

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['photo', 'aadhaarImage', 'aadhaarBackImage', 'panImage'].map(key => (
                                            <label key={key} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer group/file">
                                                <span className="text-[8px] font-black text-slate-700 group-hover:text-slate-900 uppercase tracking-tighter mb-0.5 text-center w-full truncate px-1">
                                                    {key.split(/(?=[A-Z])/).join(' ')}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-900 uppercase">{files[key] ? 'DONE' : 'UPLOAD'}</span>
                                                <input type="file" className="hidden" onChange={e => handleFileChange(e, key)} accept="image/*" />
                                            </label>
                                        ))}
                                    </div>
                                </JoiningSection>

                                <JoiningSection title="Banking node">
                                    <RegularInput label="Bank Holder" value={joiningData.accountName} onChange={v => setJoiningData({ ...joiningData, accountName: v })} required />
                                    <RegularInput label="Account No" type="password" value={joiningData.accountNumber} onChange={v => setJoiningData({ ...joiningData, accountNumber: v })} required />
                                    <RegularInput label="IFSC Code" value={joiningData.ifscCode} onChange={v => setJoiningData({ ...joiningData, ifscCode: v.toUpperCase() })} required />
                                </JoiningSection>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full h-12 bg-slate-900 rounded-xl text-[11px] font-black text-white uppercase tracking-widest shadow-lg border-none cursor-pointer mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Submit Records'}
                                </motion.button>

                                <button type="button" onClick={() => setMode('login')} className="w-full text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors py-4 uppercase tracking-widest bg-transparent border-none cursor-pointer">
                                    Abort
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
