import React, { useState } from 'react';
import {
    HiOutlineUsers,
    HiOutlineBriefcase,
    HiOutlineCash,
    HiOutlineTrendingUp,
    HiOutlineDotsVertical
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import Modal from '../../../components/common/Modal';

const AdminDashboard = () => {
    // Mock Data
    const metrics = [
        { title: 'Total Employees', value: '1,248', change: '+12.5%', icon: HiOutlineUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Attendance Rate', value: '95.2%', change: '+2.4%', icon: HiOutlineBriefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Payroll Processed', value: '₹4.5M', change: '+15.2%', icon: HiOutlineCash, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'New Offers', value: '89', change: '+8.4%', icon: HiOutlineTrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const chartData = [
        { name: 'Mon', value: 4000, value2: 2400 },
        { name: 'Tue', value: 3000, value2: 1398 },
        { name: 'Wed', value: 2000, value2: 9800 },
        { name: 'Thu', value: 2780, value2: 3908 },
        { name: 'Fri', value: 1890, value2: 4800 },
        { name: 'Sat', value: 2390, value2: 3800 },
        { name: 'Sun', value: 3490, value2: 4300 },
    ];

    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);

    const handleMetricClick = (title) => {
        setSelectedMetric(title);
        setIsMetricModalOpen(true);
    };

    const handleChartOptions = () => {
        setIsChartModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-400 mt-1">Real-time system performance metrics.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleMetricClick(metric.title)}
                        className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group relative overflow-hidden cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-lg", metric.bg, metric.color)}>
                                <metric.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full bg-slate-800", metric.color)}>
                                {metric.change}
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">{metric.title}</h3>
                        <p className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                            {metric.value}
                        </p>

                        {/* Decorative background glow */}
                        <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20", metric.bg)} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
                        <button
                            onClick={handleChartOptions}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                        >
                            <HiOutlineDotsVertical />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Secondary Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-xl bg-slate-900 border border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Department Load</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value2" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Metric Modal */}
            <Modal
                isOpen={isMetricModalOpen}
                onClose={() => setIsMetricModalOpen(false)}
                title={selectedMetric || "Metric Details"}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">Detailed breakdown and recent trends for {selectedMetric}.</p>
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-400">Category</th>
                                    <th className="p-3 font-semibold text-slate-400 text-right">Value</th>
                                    <th className="p-3 font-semibold text-slate-400 text-right">Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-slate-800/30">
                                        <td className="p-3 text-slate-300">Sub-category {i}</td>
                                        <td className="p-3 text-right text-white font-mono">{Math.floor(Math.random() * 1000)}</td>
                                        <td className="p-3 text-right text-emerald-500 text-xs font-bold">+ {Math.floor(Math.random() * 10)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* Chart Options Modal */}
            <Modal
                isOpen={isChartModalOpen}
                onClose={() => setIsChartModalOpen(false)}
                title="Chart Options"
                maxWidth="max-w-sm"
            >
                <div className="space-y-2">
                    {['View Full Report', 'Export as PDF', 'Export as CSV', 'Print Chart', 'Share Analysis'].map((action, i) => (
                        <button
                            key={i}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center justify-between group"
                            onClick={() => { alert(`Dummy Action: ${action}`); setIsChartModalOpen(false); }}
                        >
                            {action}
                            <HiOutlineTrendingUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
