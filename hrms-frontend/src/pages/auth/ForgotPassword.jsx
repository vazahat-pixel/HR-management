import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Dummy Action: Password reset link sent to ${email}`);
        setSubmitted(true);
        // Add API call logic here
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100/50">
                    <HiOutlineMail className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Identity Recovery</h1>
                <p className="text-slate-500 mt-3 font-medium flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Initiating credential reset protocol
                </p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Network Email Address</label>
                        <div className="relative group">
                            <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm text-slate-900 font-extrabold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-200"
                                placeholder="name@laxmart.com"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all"
                    >
                        Transmit Recovery Link
                    </motion.button>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-10 bg-emerald-50 border border-emerald-100 rounded-[32px] shadow-inner"
                >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-sm">
                        <HiOutlineMail className="w-8 h-8" />
                    </div>
                    <h3 className="text-emerald-900 font-black uppercase tracking-tight mb-2">Check Network Inbox</h3>
                    <p className="text-emerald-600/70 text-[11px] font-bold leading-relaxed">If an account exists for {email}, recovery instructions have been dispatched.</p>
                </motion.div>
            )}

            <div className="text-center pt-4">
                <Link to="/auth/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all gap-3 group">
                    <HiOutlineArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Return to Login Terminal
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
