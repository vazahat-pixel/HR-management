import React from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
    return (
        <div className="max-w-3xl animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">System Settings</h1>

            <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">General Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Company Name</label>
                            <input type="text" defaultValue="Krishikart" className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-primary-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Timezone</label>
                            <select className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-lg text-white">
                                <option>IST (UTC+05:30)</option>
                                <option>UTC</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Modules</h3>
                    <div className="space-y-3">
                        {['Attendance Tracking', 'Payroll Automation', 'Employee Portal', 'Recruitment'].map((module, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                <span className="text-white font-medium text-sm">{module}</span>
                                <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-4">
                    <button className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-lg hover:bg-primary-500 transition-all">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
