import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Professional Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Outlet />
                </motion.div>

                {/* Footer Branding */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">
                        &copy; 2026 Angle Courier & Service
                    </p>
                    <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Privacy Protocol</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>Security Standards</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
