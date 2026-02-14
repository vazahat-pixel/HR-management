import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineDocumentReport,
    HiOutlineChatAlt2,
    HiOutlineGift,
    HiOutlineCog,
    HiOutlineMenuAlt2,
    HiOutlineBell,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineLogout
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/admin/employees', icon: HiOutlineUsers, label: 'Employees' },
        { path: '/admin/attendance', icon: HiOutlineCalendar, label: 'Attendance' },
        { path: '/admin/salary', icon: HiOutlineCash, label: 'Payroll' },
        { path: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
        { path: '/admin/feedback', icon: HiOutlineChatAlt2, label: 'Feedback' },
        { path: '/admin/offers', icon: HiOutlineGift, label: 'Offers' },
        { path: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-indigo-500/30 flex overflow-hidden">

            {/* Sidebar Backdrop (Mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 w-60 bg-[#0c0a09] border-r border-[#27272a] z-50 flex flex-col transition-transform duration-300",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Area */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-[#27272a]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base text-zinc-100 tracking-tight leading-none">ANGLE COURIER</span>
                            <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Admin v2.0</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
                    <p className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Platform</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-zinc-800/50 text-indigo-400"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-indigo-500 rounded-full" />
                                    )}
                                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* User Profile Snippet */}
                <div className="p-3 border-t border-[#27272a] bg-[#0c0a09]">
                    <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 text-xs">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <h4 className="text-[13px] font-medium text-zinc-200 truncate group-hover:text-white">{user?.name || 'Admin'}</h4>
                            <p className="text-[11px] text-zinc-500 truncate">{user?.email || 'admin@hrms.com'}</p>
                        </div>
                        <button onClick={logout} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                            <HiOutlineLogout className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b]">

                {/* Top Header */}
                <header className="h-14 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800">
                            <HiOutlineMenuAlt2 className="w-5 h-5" />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center relative group">
                            <HiOutlineSearch className="absolute left-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search (Ctrl + K)"
                                className="h-8 pl-9 pr-4 w-64 bg-[#18181b] border border-[#27272a] rounded-md text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
                            <HiOutlineBell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full ring-2 ring-[#09090b]"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6 relative">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
