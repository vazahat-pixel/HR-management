import React from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
    return (
        <div className="max-w-4xl pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Global Configurations</h1>

            <div className="space-y-8">
                <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                        General Identity
                        <div className="h-px bg-slate-100 flex-1" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Enterprise Name</label>
                            <input
                                type="text"
                                defaultValue="LaxMart"
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                onChange={(e) => console.log("Dummy Action: Name changed to", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Operations Timezone</label>
                            <select
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                onChange={(e) => alert("Dummy Action: Timezone changed to " + e.target.value)}
                            >
                                <option>India (IST - UTC+05:30)</option>
                                <option>London (GMT - UTC+00:00)</option>
                                <option>New York (EST - UTC-05:00)</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                        Core Functional Modules
                        <div className="h-px bg-slate-100 flex-1" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Attendance Tracking', 'Payroll Automation', 'Perks & Benefits', 'Audit Reports'].map((module, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-200 hover:bg-white transition-all shadow-inner">
                                <span className="text-slate-900 font-black text-xs uppercase tracking-tight">{module}</span>
                                <div
                                    className="w-12 h-7 bg-emerald-600 rounded-full relative cursor-pointer shadow-lg shadow-emerald-500/20"
                                    onClick={() => alert(`Dummy Action: Toggled ${module}`)}
                                >
                                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-4 flex justify-end">
                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert("Dummy Action: System Preferences Saved Successfully!")}
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-300 hover:bg-emerald-600 transition-all cursor-pointer"
                    >
                        Save Preferences
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
