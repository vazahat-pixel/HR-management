import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-black flex text-white relative overflow-hidden selection:bg-zinc-800 selection:text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black z-0 pointer-events-none" />

            <div className="absolute -top-32 -left-32 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4">

                {/* Brand Logo - Floating above */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-black font-extrabold text-xl shadow-xl shadow-zinc-900/50 mb-4 ring-1 ring-zinc-800">
                        A
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-100">ANGLE COURIER</h1>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">HR Management System</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-[400px] bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative"
                >
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"></div>

                    <div className="p-6 md:p-8">
                        <Outlet />
                    </div>
                    <div className="px-8 py-4 bg-zinc-900/30 text-center border-t border-zinc-900">
                        <p className="text-[10px] text-zinc-600 font-medium">
                            &copy; 2026 Angle Courier. All rights reserved.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
