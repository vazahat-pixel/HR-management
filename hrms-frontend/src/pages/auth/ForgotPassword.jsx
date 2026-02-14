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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
                <p className="text-slate-400 mt-2 text-sm">Enter your email to receive recovery instructions.</p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <HiOutlineMail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg shadow-lg shadow-primary-500/20 transition-all"
                    >
                        Send Reset Link
                    </motion.button>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                >
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-3">
                        <HiOutlineMail className="w-6 h-6" />
                    </div>
                    <h3 className="text-emerald-400 font-bold mb-1">Check your inbox</h3>
                    <p className="text-emerald-500/70 text-sm">If an account exists for {email}, we have sent password reset instructions.</p>
                </motion.div>
            )}

            <div className="text-center mt-6">
                <Link to="/auth/login" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors gap-2">
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
