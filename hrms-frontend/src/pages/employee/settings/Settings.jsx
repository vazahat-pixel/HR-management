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
    <div className="flex items-center justify-between p-3 first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-0 group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800 group-hover:text-zinc-300 transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-[10px] font-medium text-zinc-500">{description}</p>
            </div>
        </div>
        {action}
    </div>
);

const Settings = () => {
    const { logout } = useAuth();
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="max-w-lg mx-auto space-y-6 pb-20">
            <div className="px-1">
                <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Manage your preferences and account</p>
            </div>

            <div className="bg-[#0c0a09] border border-zinc-800 rounded-xl">
                <SettingItem
                    icon={HiOutlineBell}
                    title="Notifications"
                    description="Email updates about salary & leaves"
                    action={<Toggle enabled={emailNotifs} setEnabled={setEmailNotifs} />}
                />
                <SettingItem
                    icon={HiOutlineMoon}
                    title="Dark Mode"
                    description="Toggle application theme"
                    action={<Toggle enabled={darkMode} setEnabled={setDarkMode} />}
                />
                <SettingItem
                    icon={HiOutlineKey}
                    title="Change Password"
                    description="Update your security credentials"
                    action={<button className="text-[10px] font-bold bg-zinc-900 text-zinc-300 hover:text-white px-3 py-1.5 rounded-md border border-zinc-800 transition-colors">Update</button>}
                />
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-1">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors uppercase tracking-wider"
                >
                    <HiOutlineLogout className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            <div className="text-center">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Angle Courier App v2.0.1</p>
            </div>
        </div>
    );
};

export default Settings;
