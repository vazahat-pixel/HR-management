import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePhone,
    HiOutlineShieldCheck,
    HiOutlineLockClosed,
    HiOutlineArrowLeft,
    HiOutlineExclamation,
    HiOutlineKey
} from 'react-icons/hi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP & Reset
    const [isLoading, setIsLoading] = useState(false);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authAPI.requestPasswordReset(mobile);
            toast.success('Verification code sent to your mobile.');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send recovery code.');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match.');
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters.');
        }

        setIsLoading(true);
        try {
            await authAPI.resetPassword({ mobile, otp, newPassword });
            toast.success('Password reset successful. Please login.');
            navigate('/auth/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Reset failed. Check OTP.');
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center">

            {/* Soft background accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="w-full px-5 py-8 flex flex-col relative z-10 max-w-sm">

                {/* Logo Section */}
                <div className="flex flex-col items-center pt-8 pb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center p-3 border border-slate-50"
                    >
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight mt-6">RECOVER ACCOUNT</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C46A2D] mt-1.5 opacity-80">Credential Protocol</p>
                </div>

                {/* Card Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-white p-7"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="request"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleRequestReset}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Verification</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Enter your registered mobile to receive a reset code.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#C46A2D] transition-colors" />
                                        <input
                                            type="tel"
                                            required
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#C46A2D]/5 focus:border-[#C46A2D]/40 transition-all placeholder:text-slate-300"
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={isLoading || mobile.length < 10}
                                    className="w-full h-14 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center pt-1"
                                >
                                    {isLoading ? 'Requesting...' : 'Request Code'}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="reset"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleResetPassword}
                                className="space-y-5"
                            >
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <HiOutlineShieldCheck className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mobile Verified</span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Set New Password</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Check SMS for verification code.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                                        <div className="relative group">
                                            <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold tracking-[0.5em] text-slate-900 outline-none focus:bg-white focus:border-[#C46A2D]/40 transition-all"
                                                placeholder="••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative group">
                                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-[#C46A2D]/40 transition-all"
                                                placeholder="Min 6 chars"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-[#C46A2D]/40 transition-all"
                                                placeholder="Repeat password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full h-14 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:bg-slate-800 disabled:opacity-50 pt-1"
                                >
                                    {isLoading ? 'Resetting...' : 'Update Password'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Back link */}
                <div className="mt-8 text-center">
                    <Link to="/auth/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all gap-2 group">
                        <HiOutlineArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Cancel and return
                    </Link>
                </div>

                <div className="mt-auto pt-10 text-center opacity-20">
                    <p className="text-[9px] font-black uppercase tracking-widest">© 2026 Angle Courier</p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
