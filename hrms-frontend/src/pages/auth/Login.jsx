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
        <div className="relative group/input w-full first:mt-0">
            <label className={cn(
                "absolute left-0 -top-7 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                isFocused ? "text-blue-600" : "text-slate-400"
            )}>
                {label}
            </label>
            <div className="relative flex items-center">
                <Icon className={cn(
                    "absolute left-0 w-6 h-6 transition-colors duration-300",
                    isFocused ? "text-blue-600" : "text-slate-300"
                )} />
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-b-2 border-slate-100/60 pt-5 pb-3.5 pl-10 text-base font-bold text-slate-900 placeholder:text-slate-200 outline-none hover:border-slate-200 transition-all duration-300"
                    placeholder={placeholder}
                    required
                />
                <motion.div
                    initial={false}
                    animate={{ width: isFocused ? '100%' : '0%' }}
                    className="absolute bottom-0 left-0 h-[2.5px] bg-blue-600 shadow-lg shadow-blue-100"
                />
            </div>
        </div>
    );
};

const RegularInput = ({ label, value, onChange, type = "text", required }) => (
    <div className="space-y-2 mb-6 last:mb-0">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-[13px] font-bold text-slate-900 focus:bg-white focus:border-blue-400/50 outline-none transition-all placeholder:text-slate-200"
            placeholder={label}
        />
    </div>
);

const JoiningSection = ({ title, children }) => (
    <div className="bg-white rounded-[32px] p-6 border border-slate-50 mb-8 shadow-sm">
        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-blue-500/20 rounded-full" />
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
    const [loginData, setLoginData] = useState({ employeeId: '', password: '' });

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
            const loggedInUser = await login(loginData.employeeId, loginData.password);
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
        <div className="w-full flex flex-col items-center justify-center p-4 bg-transparent">
            {/* CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
                {/* LOGO TREATMENT */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative w-[130px] h-[130px] flex items-center justify-center rounded-[40px] bg-white shadow-xl border border-white p-6">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                        <motion.div
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent skew-x-[-25deg]"
                        />
                    </div>
                </motion.div>

                {/* BRANDING */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 tracking-[-0.04em] leading-none mb-1 uppercase text-center block w-full">
                        ANGLE <span className="text-blue-600">COURIER</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.45em]">Personnel Logistics</p>
                </div>

                {/* LOGIN CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-white/90 backdrop-blur-xl rounded-[44px] shadow-2xl border border-white p-8 pt-10 relative"
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
                                        label="Employee identifier"
                                        icon={HiOutlineIdentification}
                                        value={loginData.employeeId}
                                        onChange={v => setLoginData({ ...loginData, employeeId: v })}
                                        placeholder="EX: EMP-001"
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

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full relative group/btn h-[64px] bg-slate-900 rounded-[22px] shadow-xl transition-all duration-300 flex items-center justify-center border-none cursor-pointer overflow-hidden mt-4"
                                    disabled={isLoading}
                                >
                                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 text-[13px] font-black text-white uppercase tracking-widest leading-none text-center block w-full">{isLoading ? 'Validating...' : 'Secure Login'}</span>
                                </motion.button>

                                {/* JOINING HIGHLIGHT */}
                                <div className="pt-8 border-t border-slate-50 space-y-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">New induction required?</p>
                                    <button
                                        type="button"
                                        onClick={() => setMode('joining')}
                                        className="w-full py-4 bg-orange-50 border border-orange-100 rounded-[24px] flex items-center justify-center gap-4 transition-all hover:bg-orange-100 active:scale-95 group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                                            <HiOutlineUserAdd className="w-6 h-6" />
                                        </div>
                                        <div className="text-left text-center block w-full">
                                            <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest leading-none">Register New Joining</p>
                                            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter mt-0.5">Personnel Onboarding</p>
                                        </div>
                                        <HiOutlineChevronRight className="w-5 h-5 text-orange-400 ml-auto group-hover:translate-x-1 transition-transform" />
                                    </button>
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
                                <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/95 backdrop-blur-md z-10 py-3 rounded-b-2xl">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Onboarding Induction</h3>
                                    <div className="px-2 py-1 bg-emerald-100 rounded-md text-[9px] font-black text-emerald-600 uppercase">Live Port</div>
                                </div>

                                <JoiningSection title="Legal Records">
                                    <RegularInput label="Full Legal Name" value={joiningData.fullName} onChange={v => setJoiningData({ ...joiningData, fullName: v })} required />
                                    <RegularInput label="Contact Mobile" type="tel" value={joiningData.mobile} onChange={v => setJoiningData({ ...joiningData, mobile: v.replace(/\D/g, '').slice(0, 10) })} required />
                                    <RegularInput label="Registry Email" type="email" value={joiningData.email} onChange={v => setJoiningData({ ...joiningData, email: v })} required />
                                </JoiningSection>

                                <JoiningSection title="Governance ID">
                                    <RegularInput label="PAN Identifier" value={joiningData.pan} onChange={v => setJoiningData({ ...joiningData, pan: v.toUpperCase() })} required />
                                    <RegularInput label="Aadhaar ID" value={joiningData.aadhaar} onChange={v => setJoiningData({ ...joiningData, aadhaar: v.replace(/\D/g, '').slice(0, 12) })} required />

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {['photo', 'aadhaarImage', 'aadhaarBackImage', 'panImage'].map(key => (
                                            <label key={key} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group/file">
                                                <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter mb-1 text-center w-full truncate">
                                                    {key.split(/(?=[A-Z])/).join(' ')}
                                                </span>
                                                <span className="text-[10px] font-black text-blue-500 uppercase">{files[key] ? 'Attached' : 'Upload'}</span>
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
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full h-15 bg-slate-900 rounded-[24px] text-sm font-black text-white uppercase tracking-widest shadow-xl border-none cursor-pointer mt-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Transmitting...' : 'Authorize Request'}
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
