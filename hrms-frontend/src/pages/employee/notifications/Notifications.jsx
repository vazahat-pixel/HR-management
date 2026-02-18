import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineBell,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineInformationCircle,
    HiOutlineX,
    HiOutlineTrash,
    HiOutlineDotsVertical
} from 'react-icons/hi';
import { notificationsAPI } from '../../../services/api';
import { getSocket } from '../../../services/socket';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

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
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (title = '') => {
        const t = title.toLowerCase();
        if (t.includes('approved') || t.includes('resolved') || t.includes('success')) return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />;
        if (t.includes('rejected') || t.includes('denied') || t.includes('failed')) return <HiOutlineX className="w-5 h-5 text-rose-600" />;
        if (t.includes('new') || t.includes('offer') || t.includes('update')) return <HiOutlineInformationCircle className="w-5 h-5 text-teal-600" />;
        return <HiOutlineBell className="w-5 h-5 text-amber-500" />;
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Hub</h1>
                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        System Updates
                    </p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
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
                        className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-6 h-6 border-2 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-3xl">
                    <HiOutlineBell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No notifications found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {filteredNotifications.map((n) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                key={n._id}
                                onClick={() => !n.isRead && handleMarkRead(n._id)}
                                className={`group relative overflow-hidden bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${!n.isRead ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 opacity-75 hover:opacity-100'}`}
                            >
                                <div className="flex gap-4 relative z-10">
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${!n.isRead ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                        {getIcon(n.title)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`text-sm font-black tracking-tight uppercase ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide whitespace-nowrap shrink-0">
                                                {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-1 leading-relaxed ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50/50">
                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                                                <HiOutlineClock className="w-3 h-3" />
                                                {new Date(n.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Notifications;
