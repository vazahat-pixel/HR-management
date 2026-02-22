import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineBell, HiOutlineCheckCircle, HiOutlineClock,
    HiOutlineInformationCircle, HiOutlineX, HiOutlineCurrencyDollar,
    HiOutlineTrendingUp, HiOutlineExclamationCircle, HiOutlineTicket
} from 'react-icons/hi';
import { notificationsAPI } from '../../../services/api';
import { getSocket } from '../../../services/socket';
import toast from 'react-hot-toast';

// Color config per notification type
const getTypeConfig = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('salary') || t.includes('payment') || t.includes('payslip')) return {
        border: 'border-l-[#3F7D58]', bgDot: 'bg-[#3F7D58]',
        iconBg: 'bg-emerald-50 border-emerald-100', Icon: HiOutlineCurrencyDollar, iconColor: 'text-[#3F7D58]'
    };
    if (t.includes('performance') || t.includes('report') || t.includes('payout')) return {
        border: 'border-l-[#C46A2D]', bgDot: 'bg-[#C46A2D]',
        iconBg: 'bg-orange-50 border-orange-100', Icon: HiOutlineTrendingUp, iconColor: 'text-[#C46A2D]'
    };
    if (t.includes('rejected') || t.includes('failed') || t.includes('denied') || t.includes('security')) return {
        border: 'border-l-rose-500', bgDot: 'bg-rose-500',
        iconBg: 'bg-rose-50 border-rose-100', Icon: HiOutlineExclamationCircle, iconColor: 'text-rose-600'
    };
    if (t.includes('approved') || t.includes('success') || t.includes('resolved')) return {
        border: 'border-l-emerald-500', bgDot: 'bg-emerald-500',
        iconBg: 'bg-emerald-50 border-emerald-100', Icon: HiOutlineCheckCircle, iconColor: 'text-emerald-600'
    };
    if (t.includes('offer') || t.includes('announcement') || t.includes('new')) return {
        border: 'border-l-indigo-500', bgDot: 'bg-indigo-500',
        iconBg: 'bg-indigo-50 border-indigo-100', Icon: HiOutlineTicket, iconColor: 'text-indigo-600'
    };
    return {
        border: 'border-l-slate-300', bgDot: 'bg-slate-400',
        iconBg: 'bg-slate-50 border-slate-100', Icon: HiOutlineBell, iconColor: 'text-slate-400'
    };
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsAPI.getAll({ limit: 50 });
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Load notifications error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const socket = getSocket();
        if (socket) {
            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                // Live toast pop-up for new socket notifications
                const cfg = getTypeConfig(notification.title);
                toast(notification.title, {
                    icon: '🔔',
                    style: {
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderLeft: `4px solid`,
                        fontSize: '12px',
                        fontWeight: '700',
                    },
                    duration: 5000,
                });
            });
        }
        return () => { if (socket) socket.off('new_notification'); };
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (err) { console.error(err); }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-4 sm:px-6">
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-[#C46A2D] text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full animate-pulse" />
                        System Updates
                    </p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {['all', 'unread', 'read'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f}
                        {f === 'unread' && notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-[#C46A2D] text-white rounded-full text-[8px]">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-[#C46A2D] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl">
                    <HiOutlineBell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No notifications found</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    <AnimatePresence initial={false}>
                        {filteredNotifications.map((n) => {
                            const cfg = getTypeConfig(n.title);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    key={n._id}
                                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                                    className={`group relative overflow-hidden bg-white border border-l-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${cfg.border} ${!n.isRead ? 'border-slate-100' : 'border-slate-50 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.iconBg}`}>
                                            <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={`text-sm font-black tracking-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide whitespace-nowrap shrink-0">
                                                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 leading-relaxed ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                                                    <HiOutlineClock className="w-3 h-3" />
                                                    {new Date(n.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {!n.isRead && (
                                                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${cfg.bgDot}`} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Notifications;
