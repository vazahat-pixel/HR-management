import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineDocumentReport,
    HiOutlineDocumentText,
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
import { getSocket } from '../services/socket';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [joiningBadge, setJoiningBadge] = useState(0);

    React.useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.on('new_joining_request', (data) => {
                setJoiningBadge(prev => prev + 1);
                toast.success(`New Joining Request from ${data.fullName}`, {
                    duration: 5000,
                    icon: '🚀',
                    style: {
                        borderRadius: '20px',
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                });
            });
        }
        return () => {
            if (socket) socket.off('new_joining_request');
        };
    }, []);

    const navItems = [
        { path: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        {
            path: '/admin/joining-requests',
            icon: HiOutlineUserAdd,
            label: 'Joining Requests',
            badge: joiningBadge > 0 ? joiningBadge : null
        },
        { path: '/admin/employees', icon: HiOutlineUsers, label: 'Employee List' },
        { path: '/admin/salary', icon: HiOutlineCash, label: 'Monthly Payout' },
        { path: '/admin/salary-slips', icon: HiOutlineDocumentText, label: 'Salary Slips' },
        { path: '/admin/advances', icon: HiOutlineClipboardCheck, label: 'Advance Requests' },
        { path: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Daily Reports' },
        { path: '/admin/reports/upload', icon: HiOutlineClipboardCheck, label: 'Daily Report Upload' },
        { path: '/admin/feedback', icon: HiOutlineChatAlt2, label: 'Feedback' },
        { path: '/admin/offers', icon: HiOutlineGift, label: 'Offers' },
        { path: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-background text-slate-900 font-sans antialiased selection:bg-[#C46A2D]/30 flex overflow-hidden">

            {/* Background Texture Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C46A2D]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A55522]/5 rounded-full blur-[120px]" />
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
                            <span className="text-[10px] text-[#C46A2D] font-black uppercase tracking-[0.2em] mt-1">Admin Portal</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-[#C46A2D] transition-colors">
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
                                "flex items-center gap-3.5 px-4 py-2.5 rounded-[12px] text-[13px] transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white font-bold shadow-lg shadow-[#C46A2D]/20 translate-x-1"
                                    : "text-slate-500 hover:text-[#C46A2D] hover:bg-[#F9EBE0] hover:translate-x-1 font-semibold"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-[#C46A2D]")} />
                                    <span className="tracking-tight">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
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
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm group cursor-pointer transition-all hover:border-[#C46A2D]/30">
                        <div className="w-10 h-10 rounded-xl bg-[#F9EBE0] flex items-center justify-center text-[#A55522] font-black border border-[#F9EBE0] text-sm">
                            {user?.fullName?.[0] || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <h4 className="text-[13px] font-black text-slate-900 truncate tracking-tight">{user?.fullName || 'Admin User'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tighter">Administrator</p>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-[#C46A2D] hover:bg-[#F9EBE0] rounded-xl transition-all">
                            <HiOutlineLogout className="w-5 h-5 shadow-sm" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent z-10 relative">

                {/* Top Header */}
                <header className="h-16 bg-white/60 backdrop-blur-2xl border-b border-[#DCDCDC]/50 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-[#C46A2D] rounded-lg bg-white border border-[#DCDCDC] shadow-sm">
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
                            <HiOutlineSearch className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-[#C46A2D] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-[38px] pl-9 pr-4 w-64 bg-white border border-[#DCDCDC] rounded-full text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#C46A2D]/10 focus:border-[#C46A2D] focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="h-8 w-px bg-[#DCDCDC] mx-1 hidden md:block" />
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide relative bg-background">
                    <div className="max-w-7xl mx-auto min-h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
