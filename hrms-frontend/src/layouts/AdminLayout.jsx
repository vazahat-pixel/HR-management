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
    HiOutlineLogout,
    HiOutlineClipboardCheck,
    HiOutlineUserAdd
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import NotificationDropdown from '../components/common/NotificationDropdown';
import logo from '../assets/logo.png';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/admin/joining-requests', icon: HiOutlineUserAdd, label: 'Joining Requests' },
        { path: '/admin/employees', icon: HiOutlineUsers, label: 'Employee List' },
        { path: '/admin/salary', icon: HiOutlineCash, label: 'Monthly Payout' },
        { path: '/admin/advances', icon: HiOutlineClipboardCheck, label: 'Advance Requests' },
        { path: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Daily Reports' },
        { path: '/admin/reports/upload', icon: HiOutlineClipboardCheck, label: 'Daily Report Upload' },
        { path: '/admin/feedback', icon: HiOutlineChatAlt2, label: 'Feedback' },
        { path: '/admin/offers', icon: HiOutlineGift, label: 'Offers' },
        { path: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500/30 flex overflow-hidden">

            {/* Background Texture Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar Backdrop (Mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-3xl border-r border-slate-200/60 z-[70] flex flex-col transition-all duration-500 shadow-2xl shadow-slate-200/50",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-dashed border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/50 rounded-xl p-1.5 shadow-sm border border-slate-100">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm text-slate-900 tracking-tight leading-none uppercase italic">HR Management</span>
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-1">Admin Portal</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                        <HiOutlineX className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-hide">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Admin Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3.5 px-4 py-3 rounded-[18px] text-[13px] transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 translate-x-1"
                                    : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:translate-x-1 font-semibold"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600")} />
                                    <span className="tracking-tight">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* User Profile Snippet */}
                <div className="p-4 mt-auto border-t border-dashed border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm group cursor-pointer transition-all hover:border-emerald-500/30">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black border border-emerald-100 text-sm">
                            {user?.fullName?.[0] || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <h4 className="text-[13px] font-black text-slate-900 truncate tracking-tight">{user?.fullName || 'System Arch'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tighter">Level 10 Admin</p>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <HiOutlineLogout className="w-5 h-5 shadow-sm" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent z-10 relative">

                {/* Top Header */}
                <header className="h-16 bg-white/40 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-emerald-600 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <HiOutlineMenuAlt2 className="w-5 h-5" />
                        </button>

                        <div>
                            <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                {navItems.find(n => location.pathname.includes(n.path))?.label || 'Management'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Search */}
                        <div className="hidden md:flex items-center relative group">
                            <HiOutlineSearch className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search employees, reports..."
                                className="h-9 pl-9 pr-4 w-64 bg-white/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide relative bg-transparent">
                    <div className="max-w-7xl mx-auto min-h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
