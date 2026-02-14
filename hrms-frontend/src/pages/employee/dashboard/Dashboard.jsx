import React from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineCurrencyRupee,
    HiOutlineTrendingUp,
    HiOutlineBriefcase
} from 'react-icons/hi';
import { cn } from '../../../lib/utils';

const StatCard = ({ title, value, subtext, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay * 0.1 }}
        className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all shadow-sm"
    >
        <div>
            <p className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">{title}</p>
            <h3 className="text-lg font-bold text-zinc-100 mt-1">{value}</h3>
            <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">{subtext}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:text-zinc-200 transition-colors border border-zinc-700/50">
            <Icon className="w-4 h-4" />
        </div>
    </motion.div>
);

const EmployeeDashboard = () => {
    return (
        <div className="space-y-6 pb-20 max-w-lg mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div>
                    <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Good Morning, Alex</h1>
                    <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Software Engineer II</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-sm">
                    AM
                </div>
            </header>

            {/* Main Card - Salary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl bg-[#0c0a09] border border-zinc-800 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Next Payout</p>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">₹85,000</h2>
                        </div>
                        <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400">
                            <HiOutlineCurrencyRupee className="w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wide">
                            <span>Processing</span>
                            <span className="text-zinc-200">85%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                className="h-full bg-zinc-100 rounded-full"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-2 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                            Expected on 30th Sep 2026
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    title="Attendance"
                    value="09:15 AM"
                    subtext="Punched In Today"
                    icon={HiOutlineClock}
                    delay={3}
                />
                <StatCard
                    title="Leave Balance"
                    value="12 Days"
                    subtext="Available Leaves"
                    icon={HiOutlineCalendar}
                    delay={4}
                />
            </div>

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Activity</h3>
                    <button className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-300 transition-colors">View All</button>
                </div>
                <div className="space-y-2">
                    {[
                        { title: 'Salary Credited', date: 'Yesterday', amount: '+ ₹82,000', icon: HiOutlineBriefcase, highlight: true },
                        { title: 'Leave Approved', date: '2 days ago', amount: 'Sick Leave', icon: HiOutlineCalendar, highlight: false },
                        { title: 'Late Mark', date: '3 days ago', amount: '-15 mins', icon: HiOutlineClock, highlight: false }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-md border border-zinc-800 transition-colors", item.highlight ? "bg-zinc-100 text-black border-zinc-100" : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-300")}>
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.title}</h4>
                                    <p className="text-[10px] text-zinc-600 font-medium">{item.date}</p>
                                </div>
                            </div>
                            <span className={cn("text-[11px] font-bold px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800", item.highlight ? "text-emerald-500" : "text-zinc-400")}>
                                {item.amount}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
