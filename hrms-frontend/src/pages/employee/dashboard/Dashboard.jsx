import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineCurrencyRupee,
    HiOutlineTrendingUp,
    HiOutlineBriefcase
} from 'react-icons/hi';
import { cn } from '../../../lib/utils';
import Modal from '../../../components/common/Modal';

const StatCard = ({ title, value, subtext, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay * 0.1 }}
        onClick={() => alert(`Dummy Action: View details for ${title}`)}
        className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all shadow-sm cursor-pointer"
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
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleActivityClick = (item) => {
        setSelectedActivity(item);
        setIsActivityModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-20 max-w-lg mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div>
                    <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Good Morning, Alex</h1>
                    <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Software Engineer II</p>
                </div>
                <div
                    className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-700 transition-colors"
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    AM
                </div>
            </header>

            {/* Main Card - Salary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setIsSalaryModalOpen(true)}
                className="p-5 rounded-2xl bg-[#0c0a09] border border-zinc-800 relative overflow-hidden group cursor-pointer"
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
                    <button
                        onClick={() => alert("Dummy Action: Viewing all activities")}
                        className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-2">
                    {[
                        { title: 'Salary Credited', date: 'Yesterday', amount: '+ ₹82,000', icon: HiOutlineBriefcase, highlight: true, details: "Your salary for August 2026 has been successfully credited to your bank account ending in 1234." },
                        { title: 'Leave Approved', date: '2 days ago', amount: 'Sick Leave', icon: HiOutlineCalendar, highlight: false, details: "Your sick leave request for Sep 12th has been approved by your manager." },
                        { title: 'Late Mark', date: '3 days ago', amount: '-15 mins', icon: HiOutlineClock, highlight: false, details: "You were marked late by 15 minutes on Sep 10th. Please ensure timely arrival." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            onClick={() => handleActivityClick(item)}
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

            {/* Modals */}

            {/* Salary Breakdown Modal */}
            <Modal
                isOpen={isSalaryModalOpen}
                onClose={() => setIsSalaryModalOpen(false)}
                title="Current Month Forecast"
            >
                <div className="space-y-4">
                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Estimated Payout</p>
                        <h3 className="text-2xl font-bold text-white">₹85,000.00</h3>
                        <p className="text-xs text-emerald-500 font-bold mt-1">+ Bonus Included</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-zinc-400 p-2 bg-zinc-900/50 rounded-lg">
                            <span>Base Salary</span>
                            <span className="text-zinc-200">₹70,000</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 p-2 bg-zinc-900/50 rounded-lg">
                            <span>Performance Bonus</span>
                            <span className="text-zinc-200">₹15,000</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 p-2 bg-zinc-900/50 rounded-lg">
                            <span>Deductions</span>
                            <span className="text-rose-400">- ₹0</span>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Activity Details Modal */}
            <Modal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                title="Activity Details"
            >
                {selectedActivity && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                            <div className="p-3 bg-zinc-800 rounded-xl text-white">
                                <selectedActivity.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedActivity.title}</h3>
                                <p className="text-sm text-zinc-400">{selectedActivity.date}</p>
                            </div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed text-sm">
                            {selectedActivity.details}
                        </p>
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-center">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Impact</p>
                            <p className="text-lg font-bold text-white mt-1">{selectedActivity.amount}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Profile Modal Summary */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="My Profile"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-zinc-400 border-2 border-zinc-700">
                        AM
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Alex Morgan</h3>
                        <p className="text-sm text-zinc-400">Software Engineer II</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p className="text-xs text-zinc-500">Employee ID</p>
                            <p className="text-zinc-200 font-bold">EMP-1024</p>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p className="text-xs text-zinc-500">Join Date</p>
                            <p className="text-zinc-200 font-bold">Jan 2023</p>
                        </div>
                    </div>
                    <button
                        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                        onClick={() => alert("Dummy Action: Navigate to Full Profile Page")}
                    >
                        View Full Profile
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeDashboard;
