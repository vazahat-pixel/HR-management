import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineUser,
    HiOutlineBell,
    HiOutlineLogout,
    HiOutlineDocumentText,
    HiOutlineChatAlt2,
    HiOutlineGift,
    HiOutlineTrendingUp,
    HiOutlineClipboardCheck,
    HiOutlineTicket
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import NotificationDropdown from '../components/common/NotificationDropdown';
import GlobalPopup from '../components/common/OfferPopup';
import logo from '../assets/logo.png';

const EmployeeLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Profile Completion Enforcement Logic
    const isProfileIncomplete = React.useMemo(() => {
        if (!user) return false;
        // Require these key fields for profile to be considered "complete"
        const requiredFields = [
            'fullName', 'email', 'mobile', 'partnerName',
            'hubName', 'address', 'bankAccount', 'ifscCode',
            'aadhaar', 'pan'
        ];
        // Allow temporary bypass for testing as requested
        // return requiredFields.some(field => !user[field]);
        return false;
    }, [user]);

    const [showFestivalEffect, setShowFestivalEffect] = React.useState(false);

    React.useEffect(() => {
        if (isProfileIncomplete && location.pathname !== '/employee/profile') {
            navigate('/employee/profile', { replace: true });
        }
    }, [isProfileIncomplete, location.pathname, navigate]);

    // Check for "Festival" or "Offer" notifications and trigger effect
    React.useEffect(() => {
        const checkNotifications = async () => {
            try {
                // Fetch latest notifications (assuming endpoint exists or use recent from dashboard)
                // For now, we'll check local storage or a mock check if API not fully ready for polling
                // In production, use a socket or polling. Here, we run once on mount.
                // We'll use the 'notificationsAPI' to check latest.
                const { data } = await notificationsAPI.getAll({ limit: 5 });
                const festivalKeywords = ['festival', 'diwali', 'holi', 'eid', 'christmas', 'new year', 'bonus', 'offer', 'cracker', 'celebration'];

                const hasFestivalNotif = data.notifications.some(n =>
                    !n.read && festivalKeywords.some(keyword =>
                        n.title.toLowerCase().includes(keyword) || n.message.toLowerCase().includes(keyword)
                    )
                );

                if (hasFestivalNotif) {
                    triggerFestivalEffect();
                }
            } catch (error) {
                // Silent fail
            }
        };

        checkNotifications();
    }, []);

    const triggerFestivalEffect = () => {
        setShowFestivalEffect(true);
        // Auto hide after 5 seconds
        setTimeout(() => setShowFestivalEffect(false), 5000);
    };

    const navItems = [
        { path: '/employee/dashboard', icon: HiOutlineHome, label: 'Home' },
        { path: '/employee/performance', icon: HiOutlineClipboardCheck, label: 'Reports' },
        { path: '/employee/salary', icon: HiOutlineDocumentText, label: 'Salary Slips' },
        { path: '/employee/advance', icon: HiOutlineCash, label: 'Advance' },
        { path: '/employee/feedback', icon: HiOutlineChatAlt2, label: 'Support' },
        { path: '/employee/offers', icon: HiOutlineTicket, label: 'Offers' },
        { path: '/employee/profile', icon: HiOutlineUser, label: 'Profile' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen bg-background text-slate-900 font-sans antialiased selection:bg-[#C46A2D]/20 flex flex-col lg:flex-row overflow-hidden relative"
        >

            {/* Background Texture Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-[#C46A2D]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-[#A55522]/5 rounded-full blur-[100px]" />
            </div>

            {/* Desktop Sidebar (Visible on LG+) */}
            <aside className={cn(
                "hidden lg:flex w-72 flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-3xl z-50 shadow-2xl shadow-slate-200/30",
                isProfileIncomplete && "pointer-events-none opacity-50"
            )}>
                <div className="h-24 flex items-center px-8 border-b border-dashed border-slate-100">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/50 rounded-xl p-1.5 shadow-sm border border-slate-100">
                            <img src={logo} alt="AC Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-[13px] text-slate-900 tracking-tight leading-none uppercase italic">Employee Portal</span>
                            <span className="text-[10px] text-[#C46A2D] font-black uppercase tracking-widest mt-1.5">User Workspace</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-10 px-5 space-y-1.5 scrollbar-hide">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Main Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-4 py-2.5 rounded-[12px] text-[13px] font-bold transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white shadow-lg shadow-[#C46A2D]/20 translate-x-1"
                                    : "text-slate-500 hover:text-[#C46A2D] hover:bg-[#F9EBE0] hover:translate-x-1"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-[#C46A2D]")} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-dot"
                                            className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                </nav>

                <div className="p-6 border-t border-dashed border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm group hover:border-[#C46A2D]/30 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-[#F9EBE0] flex items-center justify-center text-sm font-black text-[#A55522] border border-[#DCDCDC]">
                            {user?.fullName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-xs font-black text-slate-900 truncate tracking-tight">{user?.fullName || 'User'}</span>
                            <span className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tighter mt-0.5">Senior Associate</span>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-300 hover:text-[#C46A2D] hover:bg-[#F9EBE0] rounded-xl transition-all">
                            <HiOutlineLogout className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 bg-transparent">

                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-xl p-1 shadow-sm border border-slate-100">
                            <img src={logo} alt="AC Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-extrabold text-xs tracking-tight text-slate-900 uppercase">Angle Courier</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isProfileIncomplete && (
                            <div className="px-2 py-0.5 bg-rose-50 border border-rose-100 rounded text-[9px] font-black text-rose-600 uppercase tracking-wide">
                                Incomplete
                            </div>
                        )}
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-28 lg:p-10 relative bg-background">
                    <div className="max-w-2xl mx-auto space-y-5">
                        {isProfileIncomplete && location.pathname !== '/employee/profile' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#FFFFFF] border border-[#B23A48] p-4 rounded-xl mb-4 flex items-center gap-3 shadow-sm"
                            >
                                <span className="text-xl">⚠️</span>
                                <p className="text-xs font-bold text-[#B23A48]">Action Required: Format your profile to unlock features.</p>
                            </motion.div>
                        )}

                        <Outlet />
                    </div>
                </main>

                {/* FIXED MOBILE BOTTOM NAV - ENSURING NO DISTORTION */}
                <nav className={cn(
                    "lg:hidden fixed bottom-6 left-4 right-4 z-50 transition-all duration-700",
                    isProfileIncomplete ? "translate-y-32 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                )}>
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]" />

                    <div className="relative z-10 flex items-center justify-between p-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center justify-center transition-all duration-500",
                                    isActive ? "flex-[2.5]" : "flex-1 min-w-[40px]"
                                )}
                            >
                                {({ isActive }) => (
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2.5 rounded-[20px] transition-all duration-300",
                                        isActive
                                            ? "bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white shadow-lg shadow-[#C46A2D]/40 w-full justify-center"
                                            : "text-slate-500 hover:text-white"
                                    )}>
                                        <item.icon className={cn("w-5 h-5 shrink-0", isActive && "scale-110")} />
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
                <GlobalPopup />

                {/* Festival Effect Overlay */}
                <AnimatePresence>
                    {showFestivalEffect && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
                        >
                            <div className="firework" style={{ left: '15%', top: '30%', animationDelay: '0s' }}></div>
                            <div className="firework" style={{ left: '85%', top: '25%', animationDelay: '0.5s' }}></div>
                            <div className="firework" style={{ left: '50%', top: '50%', animationDelay: '1s' }}></div>
                            <div className="firework" style={{ left: '30%', top: '70%', animationDelay: '1.5s' }}></div>
                            <div className="firework" style={{ left: '70%', top: '60%', animationDelay: '2s' }}></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default EmployeeLayout;
