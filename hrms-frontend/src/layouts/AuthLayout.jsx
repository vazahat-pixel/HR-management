import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-[#1B2B44] flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Content Container */}
            <div className="relative z-10 w-full flex-1 flex flex-col">
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
                        &copy; 2026 Angle Courier Service
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
