import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineClock, HiOutlineInformationCircle, HiOutlineX } from 'react-icons/hi';
import { notificationsAPI } from '../../services/api';
import { cn } from '../../lib/utils';
import { getSocket } from '../../services/socket';

const NotificationDropdown = ({ isMobile = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsAPI.getAll({ limit: 10 });
            setNotifications(res.data.notifications || []);
            const countRes = await notificationsAPI.getUnreadCount();
            setUnreadCount(countRes.data.count || 0);
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
                setNotifications(prev => [notification, ...prev].slice(0, 10));
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (title) => {
        if (title.includes('Approved') || title.includes('Resolved')) return <HiOutlineCheckCircle className="w-5 h-5 text-teal-500 bg-teal-50 p-1 rounded-lg" />;
        if (title.includes('Rejected') || title.includes('Denied')) return <HiOutlineX className="w-5 h-5 text-rose-500 bg-rose-50 p-1 rounded-lg" />;
        if (title.includes('New') || title.includes('Offer')) return <HiOutlineInformationCircle className="w-5 h-5 text-emerald-500 bg-emerald-50 p-1 rounded-lg" />;
        return <HiOutlineClock className="w-5 h-5 text-orange-500 bg-orange-50 p-1 rounded-lg" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2.5 rounded-2xl transition-all duration-300 cursor-pointer group hover:shadow-lg active:scale-95",
                    isMobile ? "text-slate-400 hover:text-emerald-600 bg-white shadow-sm border border-slate-200" : "text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm"
                )}
            >
                <HiOutlineBell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[1.25rem] h-5 px-1 bg-emerald-600 rounded-full text-[10px] text-white font-black flex items-center justify-center ring-2 ring-white animate-bounce shadow-lg shadow-emerald-500/20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "absolute z-[100] mt-4 w-96 bg-white/90 backdrop-blur-3xl border border-white shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] rounded-[32px] overflow-hidden",
                            isMobile ? "fixed inset-x-4 top-20 mx-auto w-auto" : "-right-2 lg:right-0"
                        )}
                    >
                        <div className="p-6 border-b border-dashed border-slate-100 flex items-center justify-between bg-white/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Activity Stream</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latest System Updates</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[10px] font-black text-emerald-600 hover:bg-emerald-100 transition-all uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="max-h-[480px] overflow-y-auto scrollbar-hide py-2">
                            {loading && notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-slate-400 font-bold mt-4 animate-pulse uppercase tracking-tighter text-emerald-600">Syncing Stream...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-slate-100 rotate-6">
                                        <HiOutlineBell className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm text-slate-900 font-black tracking-tight uppercase">All Clear!</p>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-1">Your notification stream is currently empty.</p>
                                </div>
                            ) : (
                                <div className="px-2 space-y-1">
                                    {notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={cn(
                                                "p-4 flex gap-4 transition-all duration-300 relative rounded-2xl cursor-default group hover:bg-emerald-50/20",
                                                !n.isRead && "bg-emerald-50/40"
                                            )}
                                        >
                                            <div className="mt-0.5 transform group-hover:scale-110 transition-transform">{getIcon(n.title)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-2">
                                                    <p className={cn("text-sm font-black tracking-tight truncate uppercase italic", !n.isRead ? "text-slate-900" : "text-slate-500")}>
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={(e) => handleMarkRead(n._id, e)}
                                                            className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                                        />
                                                    )}
                                                </div>
                                                <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-bold">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <HiOutlineClock className="w-3 h-3 text-slate-300" />
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-dashed border-slate-100">
                            <button
                                onClick={() => {
                                    window.location.href = '/employee/notifications';
                                    setIsOpen(false);
                                }}
                                className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all block text-center uppercase tracking-widest"
                            >
                                Enter Notifications Hub
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
