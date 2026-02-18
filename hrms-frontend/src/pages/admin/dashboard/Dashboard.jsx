import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        { title: 'Total Employees', value: data.totalEmployees || 0, sub: `${data.activeEmployees || 0} active employees`, icon: HiOutlineUsers, color: 'text-indigo-600', gradient: 'from-indigo-500/10 to-transparent' },
        { title: 'Daily Reports', value: data.todayReports || 0, sub: 'reports submitted today', icon: HiOutlineClipboardCheck, color: 'text-teal-600', gradient: 'from-teal-500/10 to-transparent' },
        { title: 'Monthly Payout', value: `₹${(data.payrollProcessed || 0).toLocaleString()}`, sub: 'total volume this month', icon: HiOutlineCash, color: 'text-emerald-600', gradient: 'from-emerald-500/10 to-transparent' },
        { title: 'Active Offers', value: data.activeOffers || 0, sub: 'live announcements', icon: HiOutlineGift, color: 'text-orange-600', gradient: 'from-orange-500/10 to-transparent' },
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
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Dashboard Memory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                        Monitoring system performance and employee activities.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Active
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Compact Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{metric.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                            </div>
                            <div className={cn("p-2 rounded-lg bg-slate-50", metric.color.replace('text-', 'bg-').replace('600', '50'))}>
                                <metric.icon className={cn("w-5 h-5", metric.color)} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                <HiOutlineTrendingUp className="w-3 h-3 mr-1" /> 12.5%
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{metric.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Load Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Performance Analytics</h3>
                    </div>
                    <div className="h-64">
                        <Line data={stats} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Priority Stack */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col"
                >
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-5">Action Required</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { label: 'Joining Requests', count: data?.pendingJoining || 0, icon: HiOutlineUsers, color: 'text-blue-600 bg-blue-50' },
                            { label: 'Advance Requests', count: data?.pendingAdvances || 0, icon: HiOutlineCash, color: 'text-amber-600 bg-amber-50' },
                            { label: 'Open Complaints', count: data?.openComplaints || 0, icon: HiOutlineExclamationCircle, color: 'text-rose-600 bg-rose-50' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", item.color)}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">{item.count}</span>
                                    <HiOutlineArrowNarrowRight className="w-3 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">
                        View All Tasks
                    </button>
                </motion.div>
            </div>

            {/* Recent Activity Feed */}
            {data?.recentNotifications?.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Signals</h3>
                        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.recentNotifications.slice(0, 6).map((notif, i) => (
                            <div key={notif._id || i} className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <HiOutlineLightningBolt className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-slate-900 truncate">{notif.title}</p>
                                        <span className="text-[9px] text-slate-400 whitespace-nowrap">
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{notif.message}</p>
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
