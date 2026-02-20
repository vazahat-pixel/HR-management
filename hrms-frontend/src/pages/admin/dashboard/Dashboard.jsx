import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineUsers,
    HiOutlineCash,
    HiOutlineClipboardCheck,
    HiOutlineExclamationCircle,
    HiOutlineGift,
    HiOutlineTrendingUp,
    HiOutlineArrowNarrowRight,
    HiOutlineLightningBolt
} from 'react-icons/hi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { dashboardAPI } from '../../../services/api';
import { cn } from '../../../lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getAdmin();
            setData(res.data);
        } catch (err) {
            console.error('Admin dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const metrics = data ? [
        { title: 'Total Employees', value: data.totalEmployees || 0, sub: `${data.activeEmployees || 0} active employees`, icon: HiOutlineUsers, color: 'text-[#C46A2D]', bg: 'bg-[#F9EBE0]', path: '/admin/employees' },
        { title: 'Daily Reports', value: data.todayReports || 0, sub: 'reports submitted today', icon: HiOutlineClipboardCheck, color: 'text-[#3F7D58]', bg: 'bg-[#3F7D58]/5', path: '/admin/reports' },
        { title: 'Monthly Payout', value: `₹${(data.payrollProcessed || 0).toLocaleString()}`, sub: 'total volume this month', icon: HiOutlineCash, color: 'text-[#C46A2D]', bg: 'bg-gradient-to-tr from-[#C46A2D]/10 to-transparent', path: '/admin/salary' },
        { title: 'Active Offers', value: data.activeOffers || 0, sub: 'live announcements', icon: HiOutlineGift, color: 'text-[#A55522]', bg: 'bg-[#F9EBE0]', path: '/admin/offers' },
    ] : [];

    const stats = {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
            {
                fill: true,
                label: 'System Load',
                data: [65, 78, 66, 89, 76, 54, 45],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11 },
                cornerRadius: 12,
                displayColors: false,
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } },
        },
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-[#F9EBE0] border-t-[#C46A2D] rounded-full animate-spin shadow-lg"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Admin Dashboard</h1>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                        System Overview & Performance Tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3.5 py-2 rounded-xl bg-white border border-[#DCDCDC] text-[10px] font-black text-slate-600 shadow-sm flex items-center gap-2 uppercase tracking-wide">
                        <div className="w-2 h-2 rounded-full bg-[#3F7D58] animate-pulse" />
                        System Active
                    </span>
                    <span className="hidden sm:flex px-3.5 py-2 rounded-xl bg-white border border-[#DCDCDC] text-[10px] font-black text-slate-600 shadow-sm uppercase tracking-wide">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Compact Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(metric.path)}
                        className="bg-white border border-[#DCDCDC]/60 rounded-[20px] p-5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 group cursor-pointer hover:border-[#C46A2D]/30"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-[#C46A2D] transition-colors">{metric.title}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{metric.value}</h3>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6", metric.bg)}>
                                <metric.icon className={cn("w-6 h-6", metric.color)} />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/10">
                                +12.5%
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{metric.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid - 12 Column Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* System Load Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-12 lg:col-span-8 bg-white border border-[#DCDCDC]/60 rounded-[24px] p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Site Activity</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Weekly Statistics</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#C46A2D]" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Load Index</span>
                        </div>
                    </div>
                    <div className="h-72">
                        <Line data={stats} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Priority Stack */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-12 lg:col-span-4 bg-white border border-[#DCDCDC]/60 rounded-[24px] p-6 shadow-sm flex flex-col"
                >
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-6">Action Items</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { label: 'Joining Requests', count: data?.pendingJoining || 0, icon: HiOutlineUsers, color: 'text-slate-700 bg-[#F5F5F5]', accent: 'border-l-[#C46A2D]', path: '/admin/joining-requests' },
                            { label: 'Advance Requests', count: data?.pendingAdvances || 0, icon: HiOutlineCash, color: 'text-[#A55522] bg-[#F9EBE0]', accent: 'border-l-[#A55522]', path: '/admin/advances' },
                            { label: 'System Feedback', count: data?.openComplaints || 0, icon: HiOutlineExclamationCircle, color: 'text-[#B23A48] bg-[#B23A48]/5', accent: 'border-l-[#B23A48]', path: '/admin/feedback' },
                        ].map((item, i) => (
                            <div key={i}
                                onClick={() => navigate(item.path)}
                                className={cn("flex items-center justify-between p-4 rounded-xl border border-[#DCDCDC]/40 border-l-4 hover:border-[#DCDCDC] hover:bg-slate-50 transition-all cursor-pointer group", item.accent)}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110", item.color)}>
                                        <item.icon className="w-5 h-5 shadow-sm" />
                                    </div>
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-[#DCDCDC] shadow-sm">{item.count}</span>
                                    <HiOutlineArrowNarrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#C46A2D] group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black hover:shadow-xl transition-all active:scale-[0.98]">
                        View All Tasks
                    </button>
                </motion.div>
            </div>

            {/* Recent Activity Feed */}
            {data?.recentNotifications?.length > 0 && (
                <div className="bg-white border border-[#DCDCDC]/60 rounded-[24px] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Recent Activity</h3>
                        <button onClick={() => navigate('/admin/feedback')} className="text-[10px] font-black text-[#C46A2D] hover:text-[#A55522] uppercase tracking-[0.2em] cursor-pointer">Explore All &rarr;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {data.recentNotifications.slice(0, 6).map((notif, i) => (
                            <div key={notif._id || i} className="flex gap-4 p-4 rounded-2xl border border-[#DCDCDC]/40 hover:bg-[#F5F5F5] transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 group-hover:bg-[#F9EBE0] transition-colors">
                                    <HiOutlineLightningBolt className="w-5 h-5 text-slate-400 group-hover:text-[#C46A2D]" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{notif.title}</p>
                                        <span className="text-[9px] font-black text-slate-400 whitespace-nowrap uppercase tracking-tighter">
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-1 leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
