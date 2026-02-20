import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    HiOutlineTicket
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { dashboardAPI, notificationsAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { dailyReportsAPI } from '../../../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // ADDED: Using useNavigate
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showReportDetails, setShowReportDetails] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const [showNewReportPopup, setShowNewReportPopup] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getEmployee();
            setDashData(res.data);
            const notifs = res.data.recentNotifications || [];
            setNotifications(notifs);

            // Logic to show pop-up if a new report notification is found
            const hasNewReport = notifs.some(n =>
                n.title === 'New Daily Performance Report' &&
                !n.isRead &&
                (new Date() - new Date(n.createdAt)) < 24 * 60 * 60 * 1000 // Last 24 hours
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

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Hub...</p>
            </div>
        );
    }

    const reportExists = !!dashData?.todayReport;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pb-24 max-w-lg mx-auto"
        >
            {/* Header with Maximum Visual Impact Background */}
            <div className="relative overflow-hidden pt-12 pb-10 px-1">
                {/* Visual Background - High-Impact Colorful Animated Logo */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden translate-y-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.5, 0.7, 0.5],
                            scale: [1.1, 1.25, 1.1],
                            rotate: [-5, 5, -5]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative w-96 h-96 flex items-center justify-center"
                    >
                        {/* Dramatic Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 via-cyan-400/20 to-transparent blur-[100px] rounded-full animate-pulse" />
                        <img
                            src={logo}
                            alt="Angle Logo High Visibility"
                            className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)] opacity-90 select-none"
                        />
                    </motion.div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                {greeting()}, <span className="text-[#C46A2D]">{user?.fullName?.split(' ')[0]}</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                            {user?.designation || 'Team Member'} • {user?.department || 'Operations'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-10 h-10 rounded-xl bg-white/70 backdrop-blur-md border border-[#DCDCDC] flex items-center justify-center text-slate-400 hover:text-[#C46A2D] hover:border-[#C46A2D]/30 shadow-sm active:scale-95 transition-all"
                    >
                        <HiOutlineUser className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Daily Report Section - Clickable */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/employee/performance')}
                className={cn(
                    "rounded-[16px] p-4 shadow-sm border bg-white transition-all duration-300 cursor-pointer active:scale-98 hover:shadow-md",
                    reportExists
                        ? "border-[#3F7D58]/20 border-l-4 border-l-[#3F7D58]"
                        : "border-[#A55522]/20 border-l-4 border-l-[#A55522]"
                )}
            >
                {reportExists ? (
                    <div className="flex flex-col gap-3 pointer-events-none">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineClipboardCheck className="w-4 h-4 text-[#3F7D58]" />
                                Daily Activity Logged
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#3F7D58]/10 text-[#3F7D58] uppercase tracking-widest border border-[#3F7D58]/10">
                                Verified
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#F5F5F5] rounded-xl p-3 border border-[#DCDCDC]/50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivered</p>
                                <p className="text-xl font-black text-slate-900 leading-none mt-1.5">{dashData.todayReport.delivered}</p>
                            </div>
                            <div className="bg-[#F5F5F5] rounded-xl p-3 border border-[#DCDCDC]/50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Picked Up</p>
                                <p className="text-xl font-black text-slate-900 leading-none mt-1.5">{dashData.todayReport.picked}</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowReportDetails(true); }}
                            className="w-full h-[40px] bg-[#F9EBE0] text-[#A55522] rounded-full font-bold text-xs border border-[#F9EBE0] hover:bg-[#F9EBE0]/80 transition-colors flex items-center justify-center gap-2 pointer-events-auto"
                        >
                            View Analytics <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineClock className="w-4 h-4 text-[#A55522]" />
                                Reporting Status
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#A55522]/10 text-[#A55522] uppercase tracking-widest border border-[#A55522]/10">
                                Pending
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                            Operational performance data for today is currently pending HR upload.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#C46A2D] uppercase tracking-wider mt-2">
                            <span>Access History</span>
                            <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Quick Stats Grid - Compact */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Working Days', value: dashData?.monthWorkingDays || 0, icon: HiOutlineCalendar, color: 'text-slate-600', bg: 'bg-[#F5F5F5]' },
                    { label: 'Advance Due', value: `₹${dashData?.pendingAdvances || 0}`, icon: HiOutlineCurrencyDollar, color: 'text-[#B23A48]', bg: 'bg-[#B23A48]/5' },
                    { label: 'Open Support', value: dashData?.openComplaints || 0, icon: HiOutlineChatAlt2, color: 'text-[#A55522]', bg: 'bg-[#F9EBE0]' },
                    { label: 'Performance', value: '98%', icon: HiOutlineTrendingUp, color: 'text-[#3F7D58]', bg: 'bg-[#3F7D58]/5' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-3.5 rounded-[16px] border border-[#DCDCDC]/50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-lg font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border border-transparent transition-colors", stat.bg, stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Financial Card - Clickable */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/employee/salary')}
                className="bg-white rounded-[16px] p-4 border border-[#DCDCDC] shadow-sm flex items-center justify-between relative overflow-hidden group cursor-pointer active:scale-98 hover:border-[#C46A2D]/30 transition-all hover:shadow-lg"
            >
                <div className="absolute top-0 right-0 w-24 h-full bg-[#F5F5F5] skew-x-12 translate-x-12 group-hover:translate-x-6 transition-transform duration-500 ease-out" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-[#C46A2D] transition-colors">Net Salary Payload</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">₹</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">
                            {dashData?.latestPayslip?.netPayable?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <p className="text-[8px] font-black text-[#C46A2D] uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Request Statement &rarr;</p>
                </div>
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#F9EBE0] text-[#C46A2D] flex items-center justify-center border border-[#F9EBE0]/50 group-hover:scale-110 transition-transform shadow-sm">
                    <HiOutlineCurrencyDollar className="w-6 h-6" />
                </div>
            </motion.div>

            {/* Premium Notifications */}
            <div className="pt-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 flex items-center justify-between">
                    Recent Intelligence
                    <span className="w-8 h-px bg-[#DCDCDC]" />
                </h3>
                <div className="space-y-2.5">
                    {notifications.length > 0 ? (
                        <div className="space-y-2.5">
                            {notifications.slice(0, 4).map((notif, i) => {
                                // Dynamic Icons based on Title
                                let Icon = HiOutlineBell;
                                let iconBg = "bg-slate-100 text-slate-400";

                                if (notif.title.toLowerCase().includes('salary') || notif.title.toLowerCase().includes('payment')) {
                                    Icon = HiOutlineCurrencyDollar;
                                    iconBg = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                } else if (notif.title.toLowerCase().includes('performance') || notif.title.toLowerCase().includes('report')) {
                                    Icon = HiOutlineTrendingUp;
                                    iconBg = "bg-[#F9EBE0] text-[#C46A2D] border-[#F9EBE0]";
                                } else if (notif.title.toLowerCase().includes('security') || notif.title.toLowerCase().includes('password')) {
                                    Icon = HiOutlineExclamationCircle;
                                    iconBg = "bg-red-50 text-red-600 border-red-100";
                                } else if (notif.title.toLowerCase().includes('offer') || notif.title.toLowerCase().includes('announcement')) {
                                    Icon = HiOutlineTicket;
                                    iconBg = "bg-indigo-50 text-indigo-600 border-indigo-100";
                                }

                                return (
                                    <motion.div
                                        key={notif._id || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-center gap-4 p-4 bg-white rounded-[20px] border border-[#DCDCDC]/50 shadow-sm hover:shadow-md transition-all group cursor-default"
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform group-hover:scale-110", iconBg)}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-[13px] font-bold text-slate-900 tracking-tight truncate">{notif.title}</h4>
                                                <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">
                                                    {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{notif.message}</p>
                                        </div>
                                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all", notif.isRead ? "bg-transparent" : "bg-[#C46A2D] shadow-sm shadow-[#C46A2D]/40")} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-white/50 rounded-[16px] border border-dashed border-[#DCDCDC]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent updates</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Operative Identity">
                <div className="p-4 space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
                            {user?.fullName?.[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">{user?.fullName}</h3>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{user?.employeeId}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white border border-slate-100 rounded-xl">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Department</p>
                            <p className="text-xs font-bold text-slate-900">{user?.department || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Hub Location</p>
                            <p className="text-xs font-bold text-slate-900">{user?.hubName || 'N/A'}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowProfileModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Close Dossier</button>
                </div>
            </Modal>

            {/* New Report Announcement Modal */}
            <Modal
                isOpen={showNewReportPopup}
                onClose={() => setShowNewReportPopup(false)}
                title="Performance Update Available"
                maxWidth="max-w-md"
            >
                <div className="p-4 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-xl shadow-emerald-500/10">
                        <HiOutlineCheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Nice Work, {user?.fullName?.split(' ')[0]}!</h3>
                        <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">
                            Your performance report for {dashData?.todayReport ? new Date(dashData.todayReport.reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'today'} is now active.
                        </p>
                    </div>

                    <div className="w-full bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-12 translate-x-12" />
                        <div className="grid grid-cols-2 gap-8 relative z-10">
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
                            onClick={() => {
                                setShowNewReportPopup(false);
                                setShowReportDetails(true);
                            }}
                            className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            View Analysis
                        </button>
                        <button
                            onClick={() => setShowNewReportPopup(false)}
                            className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Report Details Modal */}
            <Modal isOpen={showReportDetails} onClose={() => setShowReportDetails(false)} title="Performance Telemetry">
                {dashData?.todayReport ? (
                    <div className="p-4 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                                <span className="text-xs font-bold text-slate-900">{new Date(dashData.todayReport.reportDate).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Out For Delivery</p>
                                    <p className="text-xl font-black text-slate-900">{dashData.todayReport.ofd}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivered</p>
                                    <p className="text-xl font-black text-emerald-600">{dashData.todayReport.delivered}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Out For Pickup</p>
                                    <p className="text-xl font-black text-slate-900">{dashData.todayReport.ofp}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Picked Up</p>
                                    <p className="text-xl font-black text-indigo-600">{dashData.todayReport.picked}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadReport}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Download Receipt <HiOutlineDownload className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-sm font-bold text-slate-400">No data available.</p>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};

export default Dashboard;
