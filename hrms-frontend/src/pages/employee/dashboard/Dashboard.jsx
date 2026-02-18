import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ADDED: Import navigate
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

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // ADDED: Using useNavigate
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showReportDetails, setShowReportDetails] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getEmployee();
            setDashData(res.data);
            setNotifications(res.data.recentNotifications || []);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        // Placeholder for download functionality
        toast.success("Downloading Report...");
        // In a real app, this would trigger a PDF/CSV download
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
        <div className="space-y-5 pb-32 max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-1 pt-2">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        {greeting()}, <span className="text-emerald-600">{user?.fullName?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                        {user?.designation || 'Team Member'} • {user?.department || 'Operations'}
                    </p>
                </div>
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 shadow-sm active:scale-95 transition-all"
                >
                    <HiOutlineUser className="w-5 h-5" />
                </button>
            </div>

            {/* Daily Report Section - Clickable */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/employee/performance')}
                className={cn(
                    "rounded-xl p-4 shadow-sm border bg-white transition-all duration-300 cursor-pointer active:scale-95 hover:shadow-md",
                    reportExists
                        ? "border-emerald-100 border-l-4 border-l-emerald-500"
                        : "border-amber-100 border-l-4 border-l-amber-500"
                )}
            >
                {reportExists ? (
                    <div className="flex flex-col gap-3 pointer-events-none">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineClipboardCheck className="w-4 h-4 text-emerald-500" />
                                Daily Activity Logged
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wide">
                                Verified
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Delivered</p>
                                <p className="text-lg font-bold text-slate-900 leading-none mt-1">{dashData.todayReport.delivered}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Picked Up</p>
                                <p className="text-lg font-bold text-slate-900 leading-none mt-1">{dashData.todayReport.picked}</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowReportDetails(true); }}
                            className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 pointer-events-auto"
                        >
                            View Details <HiOutlineDocumentText className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineClock className="w-4 h-4 text-amber-500" />
                                Reporting Status
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 uppercase tracking-wide">
                                Pending
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                            Performance data for today has not been uploaded by HR yet.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-2">
                            <span>Tap to view history</span>
                            <HiOutlineTrendingUp className="w-3 h-3" />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Quick Stats Grid - 2x2 Compact */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Working Days', value: dashData?.monthWorkingDays || 0, icon: HiOutlineCalendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Advance Due', value: `₹${dashData?.pendingAdvances || 0}`, icon: HiOutlineCurrencyDollar, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Open Tickets', value: dashData?.openComplaints || 0, icon: HiOutlineChatAlt2, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Performance', value: '98%', icon: HiOutlineTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-base font-bold text-slate-900 mt-0.5">{stat.value}</p>
                        </div>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Financial Card - Light Theme - Clickable */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/employee/salary')}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group cursor-pointer active:scale-95 hover:border-emerald-300 transition-all"
            >
                <div className="absolute top-0 right-0 w-20 h-full bg-emerald-50 skew-x-12 translate-x-10 group-hover:translate-x-5 transition-transform duration-500" />
                <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-emerald-600 transition-colors">Net Salary Payload</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-slate-500">₹</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {dashData?.latestPayslip?.netPayable?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">View Slip &rarr;</p>
                </div>
                <div className="relative z-10 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                    <HiOutlineCurrencyDollar className="w-5 h-5" />
                </div>
            </motion.div>

            {/* Minimal Notifications */}
            <div className="pt-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Recent Updates</h3>
                <div className="space-y-2">
                    {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((notif, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{notif.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p className="text-[10px] text-slate-400">No recent updates</p>
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
        </div>
    );
};

export default Dashboard;
