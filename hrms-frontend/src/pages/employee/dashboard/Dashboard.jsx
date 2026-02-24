import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import CountUp from 'react-countup';
import logo from '../../../assets/logo.png';
import {
    HiOutlineCurrencyDollar,
    HiOutlineClipboardCheck,
    HiOutlineBell,
    HiOutlineTrendingUp,
    HiOutlineCalendar,
    HiOutlineDocumentText,
    HiOutlineUser,
    HiOutlineChatAlt2,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDownload,
    HiOutlineExclamationCircle,
    HiOutlineTicket,
    HiArrowRight,
    HiOutlineLogout
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { dashboardAPI, notificationsAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { dailyReportsAPI } from '../../../services/api';

// Profile completeness checker — fields that must be filled
const isProfileComplete = (u) => !!(u?.isProfileCompleted || (u?.email && u?.mobile && !u.mobile.startsWith('MISSING-') && u?.address));

// ─── Reusable Glass Card ────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', onClick, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        className={cn(
            'relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] overflow-hidden',
            onClick && 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]',
            className
        )}
    >
        {children}
    </motion.div>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showReportDetails, setShowReportDetails] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNewReportPopup, setShowNewReportPopup] = useState(false);
    const profileComplete = isProfileComplete(user);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getEmployee();
            setDashData(res.data);
            const notifs = res.data.recentNotifications || [];
            setNotifications(notifs);

            const hasNewReport = notifs.some(n =>
                n.title === 'New Daily Performance Report' &&
                !n.isRead &&
                (new Date() - new Date(n.createdAt)) < 24 * 60 * 60 * 1000
            );

            if (hasNewReport) {
                setShowNewReportPopup(true);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!dashData?.todayReport?._id) {
            toast.error("No report ID found");
            return;
        }
        const loadingToast = toast.loading("Generating Secure Receipt...");
        try {
            const res = await dailyReportsAPI.downloadReceipt(dashData.todayReport._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Daily_Receipt_${new Date().toLocaleDateString()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Receipt Downloaded", { id: loadingToast });
        } catch (err) {
            console.error('Download error:', err);
            toast.error("Failed to generate PDF", { id: loadingToast });
        }
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-5">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C46A2D] to-orange-300 opacity-20 animate-ping" />
                    <div className="w-16 h-16 border-[3px] border-slate-100 border-t-[#C46A2D] rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] animate-pulse">Syncing workspace…</p>
            </div>
        );
    }

    const reportExists = !!dashData?.todayReport;

    const stats = [
        {
            label: 'Active Days',
            value: dashData?.monthWorkingDays || 0,
            isNumber: true,
            icon: HiOutlineCalendar,
            gradient: 'from-violet-500 to-indigo-500',
            lightBg: 'bg-violet-50',
            textColor: 'text-violet-600',
            delay: 0.05
        },
        {
            label: 'Advance Due',
            value: dashData?.pendingAdvances || 0,
            isNumber: true,
            prefix: '₹',
            icon: HiOutlineCurrencyDollar,
            gradient: 'from-rose-500 to-pink-500',
            lightBg: 'bg-rose-50',
            textColor: 'text-rose-500',
            delay: 0.1
        },
        {
            label: 'Complaints',
            value: dashData?.openComplaints || 0,
            isNumber: true,
            icon: HiOutlineChatAlt2,
            gradient: 'from-amber-500 to-orange-400',
            lightBg: 'bg-amber-50',
            textColor: 'text-amber-600',
            delay: 0.15
        },
        {
            label: 'Efficiency',
            value: 98,
            isNumber: true,
            suffix: '%',
            icon: HiOutlineTrendingUp,
            gradient: 'from-emerald-500 to-teal-500',
            lightBg: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            delay: 0.2
        },
    ];

    return (
        <>
            {/* Soft gradient page bg — placed behind everything */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pb-32 max-w-lg mx-auto"
            >
                {/* ─── Profile Completion Banner ──────────────────────────── */}
                <AnimatePresence>
                    {!profileComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-800 to-[#7B3A1A] p-5 shadow-2xl"
                        >
                            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#C46A2D]/30 rounded-full blur-2xl" />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.25em]">Action Required</p>
                                    </div>
                                    <h2 className="text-lg font-black text-white leading-tight">
                                        Welcome, {user?.fullName?.split(' ')[0]}! 👋
                                    </h2>
                                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                                        Complete your profile to unlock salary slips, payouts, advance requests & more.
                                    </p>
                                </div>
                            </div>
                            <Link to="/employee/profile"
                                className="relative z-10 mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#C46A2D] to-[#E07B3A] hover:from-[#A55522] hover:to-[#C46A2D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#C46A2D]/30">
                                Complete Profile <HiArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Hero ─── */}
                <div className="relative pt-3 pb-4 px-1 border-b border-dashed border-slate-200/50 mb-2 min-h-32">
                    {/* Animated Top-Only Header Logo */}
                    <div className="absolute inset-y-0 right-0 pointer-events-none z-0 overflow-hidden flex items-center justify-end">
                        <motion.div
                            initial={{ x: 100, opacity: 0, scale: 0.8 }}
                            animate={{ x: 30, opacity: 0.4, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <motion.div
                                animate={{
                                    y: [-5, 5, -5],
                                    rotate: [12, 15, 12]
                                }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            >
                                <img
                                    src={logo}
                                    alt=""
                                    className="w-48 h-48 object-contain opacity-60 drop-shadow-[0_0_30px_rgba(196,106,45,0.25)]"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between relative z-10 transition-all duration-300">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-[#C46A2D] uppercase tracking-[0.4em]">{greeting()} ✦</p>
                            <h1 className="text-2xl font-black tracking-tighter text-slate-900 drop-shadow-sm">{user?.fullName?.split(' ')[0]}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowProfileModal(true)} className="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-md border border-slate-100 flex items-center justify-center text-slate-400">
                                <HiOutlineUser className="w-4 h-4" />
                            </button>
                            <button onClick={() => { logout(); navigate('/login'); }} className="w-7 h-7 rounded-lg bg-red-50/80 backdrop-blur-md border border-red-100 flex items-center justify-center text-red-500 shadow-sm active:scale-90 transition-all">
                                <HiOutlineLogout className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                {/* ─── Daily Report Card ───────────────────────────────────── */}
                <GlassCard onClick={() => navigate('/employee/performance')} delay={0.02}>
                    {/* Top accent gradient bar */}
                    <div className={cn("h-1 w-full", reportExists ? "bg-emerald-400" : "bg-orange-400")} />

                    <div className="p-3">
                        {reportExists ? (
                            <div className="flex flex-col gap-3 pointer-events-none">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <span className="w-7 h-7 bg-emerald-50 rounded-xl flex items-center justify-center">
                                            <HiOutlineClipboardCheck className="w-4 h-4 text-emerald-600" />
                                        </span>
                                        Daily Activity Logged
                                    </h2>
                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100">
                                        ✓ Verified
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Delivered', val: dashData.todayReport.delivered, color: 'text-emerald-600' },
                                        { label: 'Picked Up', val: dashData.todayReport.picked, color: 'text-indigo-600' },
                                    ].map((s) => (
                                        <div key={s.label} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{s.label}</p>
                                            <p className={cn("text-xl font-black leading-none", s.color)}>{s.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowReportDetails(true); }}
                                    className="w-full h-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-bold text-xs border-0 flex items-center justify-center gap-2 pointer-events-auto shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition-all"
                                >
                                    View Analytics <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="pointer-events-none">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <span className="w-7 h-7 bg-orange-50 rounded-xl flex items-center justify-center">
                                            <HiOutlineClock className="w-4 h-4 text-[#C46A2D]" />
                                        </span>
                                        Reporting Status
                                    </h2>
                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-orange-50 text-[#C46A2D] uppercase tracking-widest border border-orange-100">
                                        Pending
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                                    Operational performance data for today is currently pending HR upload.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#C46A2D] uppercase tracking-wider">
                                    <span>Access History</span>
                                    <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* ─── Stats Grid ──────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3.5">
                    {
                        stats.map((stat, i) => (
                            <GlassCard key={i} delay={stat.delay} className="group">
                                <div className="p-3 flex flex-col gap-2">
                                    {/* Icon with gradient bg */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm",
                                        stat.lightBg
                                    )}>
                                        <stat.icon className={cn("w-4 h-4", stat.textColor)} />
                                    </div>

                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">
                                            {stat.label}
                                        </p>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                            {stat.prefix || ''}
                                            {stat.isNumber ? (
                                                <CountUp
                                                    end={stat.value}
                                                    duration={1.8}
                                                    separator=","
                                                    delay={stat.delay}
                                                />
                                            ) : stat.value}
                                            {stat.suffix || ''}
                                        </h3>
                                    </div>

                                    {/* Gradient accent bar at bottom */}
                                    <div className={cn(
                                        "h-0.5 w-8 rounded-full opacity-60 bg-gradient-to-r transition-all duration-500 group-hover:w-full group-hover:opacity-100",
                                        stat.gradient
                                    )} />
                                </div>
                            </GlassCard>
                        ))
                    }
                </div>

                {/* ─── Financial Hero ─── */}
                <GlassCard onClick={() => navigate('/employee/salary')} delay={0.25}>
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C46A2D]/10 blur-3xl" />

                        <div className="relative z-10 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Latest Net Salary</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-orange-400">₹</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        {dashData?.latestPayslip?.netPayable ? (
                                            <CountUp end={dashData.latestPayslip.netPayable} duration={2} separator="," delay={0.3} />
                                        ) : '0'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C46A2D] to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <HiOutlineCurrencyDollar className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* ─── Updates ─── */}
                <div className="pt-1">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recent Updates</h3>
                        <span className="w-8 h-px bg-slate-200" />
                    </div>

                    <div className="space-y-2">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 3).map((notif, i) => {
                                let Icon = HiOutlineBell;
                                let style = 'bg-slate-50 text-slate-400';
                                if (notif.title.toLowerCase().includes('salary')) { Icon = HiOutlineCurrencyDollar; style = 'bg-emerald-50 text-emerald-600'; }
                                else if (notif.title.toLowerCase().includes('report')) { Icon = HiOutlineTrendingUp; style = 'bg-orange-50 text-[#C46A2D]'; }

                                return (
                                    <div key={notif._id || i} className="flex items-center gap-3 p-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-white shadow-sm">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", style)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-bold text-slate-900 truncate">{notif.title}</h4>
                                                <span className="text-[7px] font-black text-slate-300 uppercase">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{notif.message}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 bg-white/40 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-[8px] font-black text-slate-300 uppercase">No Updates</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Profile Modal ───────────────────────────────────────── */}
                < Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Your Profile" >
                    <div className="p-4 space-y-5">
                        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C46A2D] to-orange-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
                                {user?.fullName?.[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">{user?.fullName}</h3>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{user?.fhrid || user?.employeeId}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
                                <p className="text-xs font-bold text-slate-900">{user?.department || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Hub Location</p>
                                <p className="text-xs font-bold text-slate-900">{user?.hubName || 'N/A'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </Modal >

                {/* ─── New Report Popup Modal ──────────────────────────────── */}
                < Modal
                    isOpen={showNewReportPopup}
                    onClose={() => setShowNewReportPopup(false)}
                    title="Performance Update Available"
                    maxWidth="max-w-md"
                >
                    <div className="p-4 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-xl shadow-emerald-500/10">
                            <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Nice Work, {user?.fullName?.split(' ')[0]}!</h3>
                            <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">
                                Your performance report for {dashData?.todayReport ? new Date(dashData.todayReport.reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'today'} is now active.
                            </p>
                        </div>

                        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-6 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-12 translate-x-12" />
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Delivered</p>
                                    <p className="text-3xl font-black">{dashData?.todayReport?.delivered || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Picked Up</p>
                                    <p className="text-3xl font-black">{dashData?.todayReport?.picked || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={() => { setShowNewReportPopup(false); setShowReportDetails(true); }}
                                className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                View Analysis
                            </button>
                            <button
                                onClick={() => setShowNewReportPopup(false)}
                                className="w-full py-3 bg-slate-100 text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </Modal >

                {/* ─── Report Details Modal ────────────────────────────────── */}
                < Modal isOpen={showReportDetails} onClose={() => setShowReportDetails(false)} title="Performance Telemetry" >
                    {
                        dashData?.todayReport ? (
                            <div className="p-4 space-y-5" >
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Date</span>
                                        <span className="text-xs font-bold text-slate-900">{new Date(dashData.todayReport.reportDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Out For Delivery', val: dashData.todayReport.ofd, color: 'text-slate-900' },
                                            { label: 'Delivered', val: dashData.todayReport.delivered, color: 'text-emerald-600' },
                                            { label: 'Out For Pickup', val: dashData.todayReport.ofp, color: 'text-slate-900' },
                                            { label: 'Picked Up', val: dashData.todayReport.picked, color: 'text-indigo-600' },
                                        ].map((s) => (
                                            <div key={s.label}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                <p className={cn("text-2xl font-black", s.color)}>{s.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownloadReport}
                                    className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Download Receipt <HiOutlineDownload className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm font-bold text-slate-400">No data available.</p>
                            </div>
                        )}
                </Modal >
            </motion.div >
        </>
    );
};

export default Dashboard;
