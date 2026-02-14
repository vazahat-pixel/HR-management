import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineUser,
    HiOutlineBell,
    HiOutlineLogout
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const EmployeeLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/employee/dashboard', icon: HiOutlineHome, label: 'Home' },
        { path: '/employee/attendance', icon: HiOutlineCalendar, label: 'Attend' },
        { path: '/employee/salary', icon: HiOutlineCash, label: 'Pay' },
        { path: '/employee/settings', icon: HiOutlineUser, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-zinc-500/30 flex flex-col lg:flex-row overflow-hidden">

            {/* Desktop Sidebar (Visible on LG+) */}
            <aside className="hidden lg:flex w-60 flex-col border-r border-[#27272a] bg-[#0c0a09] z-50">
                <div className="h-14 flex items-center px-4 border-b border-[#27272a]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-zinc-100 tracking-tight leading-none">ANGLE COURIER</span>
                            <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Employee Portal</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-0.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-zinc-100 rounded-full" />
                                    )}
                                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-[#27272a]">
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-xs font-semibold text-zinc-200 truncate">{user?.name || 'User'}</span>
                            <span className="text-[10px] text-zinc-500 truncate">{user?.email || 'emp@angle.com'}</span>
                        </div>
                        <button onClick={logout} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors">
                            <HiOutlineLogout className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#09090b]">

                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-zinc-100 rounded flex items-center justify-center text-black font-extrabold text-xs shadow-sm">A</div>
                        <span className="font-extrabold text-sm tracking-tight text-zinc-100">ANGLE COURIER</span>
                    </div>
                    <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                        <HiOutlineBell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-100 rounded-full ring-2 ring-[#09090b]"></span>
                    </button>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6 relative">
                    <div className="max-w-xl mx-auto space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="min-h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#18181b]/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50">
                    <div className="h-14 flex items-center justify-around px-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex flex-col items-center justify-center gap-0.5 w-14 transition-all duration-200",
                                    isActive ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-400"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={cn(
                                            "p-1 rounded-lg transition-all duration-200",
                                            isActive && "bg-zinc-800 text-zinc-100"
                                        )}>
                                            <item.icon className={cn("w-5 h-5")} />
                                        </div>
                                        <span className={cn("text-[9px] font-medium transition-opacity duration-200", isActive ? "opacity-100" : "opacity-0 hidden")}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default EmployeeLayout;
