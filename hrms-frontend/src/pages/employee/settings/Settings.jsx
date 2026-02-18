import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { HiOutlineBell, HiOutlineMoon, HiOutlineKey, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';

const Toggle = ({ enabled, setEnabled }) => (
    <div
        onClick={() => setEnabled(!enabled)}
        className={cn(
            "w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors",
            enabled ? "bg-zinc-100" : "bg-zinc-800"
        )}
    >
        <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn("w-4 h-4 rounded-full shadow-sm", enabled ? "bg-black" : "bg-zinc-500")}
            animate={{ x: enabled ? 16 : 0 }}
        />
    </div>
);

const SettingItem = ({ icon: Icon, title, description, action }) => (
    <div className="flex items-center justify-between p-6 first:rounded-t-[32px] last:rounded-b-[32px] hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:text-emerald-500 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{title}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p>
            </div>
        </div>
        {action}
    </div>
);

const Settings = () => {
    const { logout } = useAuth();
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const Toggle = ({ enabled, setEnabled }) => (
        <div
            onClick={() => setEnabled(!enabled)}
            className={cn(
                "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner",
                enabled ? "bg-emerald-500" : "bg-slate-200"
            )}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-white shadow-lg"
                animate={{ x: enabled ? 24 : 0 }}
            />
        </div>
    );

    return (
        <div className="max-w-xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100/50">
                    <HiOutlineCog className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Preferences</h1>
                <p className="text-slate-500 mt-3 font-medium flex items-center justify-center gap-2 italic">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Configure your operational environment
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
                <SettingItem
                    icon={HiOutlineBell}
                    title="Network Alerts"
                    description="Email updates for fiscal & schedule events"
                    action={<Toggle enabled={emailNotifs} setEnabled={setEmailNotifs} />}
                />
                <SettingItem
                    icon={HiOutlineMoon}
                    title="Visual Mode"
                    description="Switch between Light & Dark aesthetics"
                    action={<Toggle enabled={darkMode} setEnabled={setDarkMode} />}
                />
                <SettingItem
                    icon={HiOutlineKey}
                    title="Identity Key"
                    description="Update secure access credentials"
                    action={<button onClick={() => alert("Dummy Action: Initiating Secure Credential Update...")} className="text-[9px] font-black bg-slate-900 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl transition-all uppercase tracking-widest shadow-xl shadow-slate-200">Update</button>}
                />
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-[32px] p-2">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 p-5 text-[10px] font-black text-rose-600 hover:bg-rose-600 hover:text-white rounded-[24px] transition-all uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:shadow-rose-100"
                >
                    <HiOutlineLogout className="w-5 h-5" />
                    Terminate Session
                </button>
            </div>

            <div className="text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">LaxMart Core v2.4.12</p>
            </div>
        </div>
    );
};

export default Settings;
