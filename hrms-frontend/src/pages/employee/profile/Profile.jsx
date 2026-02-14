import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const Profile = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-48 w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-800/[0.2] bg-[length:32px_32px]" />
                </div>
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-slate-600 shadow-2xl"
                    >
                        <HiOutlineUserCircle className="w-20 h-20" />
                    </motion.div>
                    <div className="mb-4 ml-6">
                        <h1 className="text-3xl font-bold text-white">Alex Morgan</h1>
                        <p className="text-primary-400 font-medium tracking-wide">Senior Developer</p>
                    </div>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4"
                >
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Personal Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlineMail className="w-5 h-5 text-slate-500" />
                            <span>alex.morgan@company.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlinePhone className="w-5 h-5 text-slate-500" />
                            <span>+1 (555) 000-1234</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlineLocationMarker className="w-5 h-5 text-slate-500" />
                            <span>San Francisco, CA</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl"
                >
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Work Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Employee ID</p>
                            <p className="text-white font-mono mt-1">EMP-2024-045</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Department</p>
                            <p className="text-white mt-1">Engineering</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Date Joined</p>
                            <p className="text-white mt-1">Aug 12, 2023</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Reports To</p>
                            <p className="text-white mt-1">Sarah Connor</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
