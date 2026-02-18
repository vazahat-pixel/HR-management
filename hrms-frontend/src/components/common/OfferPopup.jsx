import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineGift, HiOutlineX, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineBell } from 'react-icons/hi';
import { offersAPI, notificationsAPI } from '../../services/api';
import { getSocket } from '../../services/socket';

const GlobalPopup = () => {
    const [content, setContent] = useState(null); // { type: 'offer' | 'notif', data: any }
    const [show, setShow] = useState(false);

    const checkUpdates = async () => {
        try {
            // Check Offers
            const offRes = await offersAPI.getAll({ isActive: true });
            const latestOffer = offRes.data.offers?.[0];

            // Check Notifications
            const notRes = await notificationsAPI.getAll({ limit: 1 });
            const latestNotif = notRes.data.notifications?.[0];

            const seenOfferId = localStorage.getItem('seen_offer_id');
            const seenNotifId = localStorage.getItem('seen_notif_id');

            let selected = null;

            // Simple logic for initial load: if new notif and new offer, show newest by date
            const isNewOffer = latestOffer && latestOffer._id !== seenOfferId;
            const isNewNotif = latestNotif && latestNotif._id !== seenNotifId;

            if (isNewOffer && isNewNotif) {
                const offerDate = new Date(latestOffer.createdAt);
                const notifDate = new Date(latestNotif.createdAt);
                if (notifDate > offerDate) {
                    selected = { type: 'notif', data: latestNotif };
                } else {
                    selected = { type: 'offer', data: latestOffer };
                }
            } else if (isNewOffer) {
                selected = { type: 'offer', data: latestOffer };
            } else if (isNewNotif) {
                selected = { type: 'notif', data: latestNotif };
            }

            if (selected) {
                setContent(selected);
                setShow(true);
            }
        } catch (err) {
            console.error('Check updates error:', err);
        }
    };

    useEffect(() => {
        checkUpdates();

        // Socket.io Real-time listener for popups
        const socket = getSocket();
        if (socket) {
            socket.on('new_notification', (notification) => {
                // If notification contains "Offer", trigger as offer type
                const isOffer = notification.title.toLowerCase().includes('offer');
                setContent({
                    type: isOffer ? 'offer' : 'notif',
                    data: notification
                });
                setShow(true);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, []);

    const handleClose = () => {
        if (content) {
            if (content.type === 'offer') {
                localStorage.setItem('seen_offer_id', content.data._id);
            } else {
                localStorage.setItem('seen_notif_id', content.data._id);
                notificationsAPI.markRead(content.data._id).catch(() => { });
            }
        }
        setShow(false);
    };

    if (!show || !content) return null;

    const isOffer = content.type === 'offer';
    const data = content.data;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-[#0c0a09] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header Gradient */}
                    <div className={`h-24 bg-gradient-to-br ${isOffer ? 'from-indigo-500 to-purple-600' : 'from-amber-500 to-orange-600'} flex items-center justify-center relative`}>
                        <div className="absolute top-0 right-0 p-3">
                            <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className={`w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center ${isOffer ? 'text-indigo-600' : 'text-amber-600'} rotate-12`}>
                            {isOffer ? <HiOutlineGift className="w-8 h-8" /> : <HiOutlineBell className="w-8 h-8" />}
                        </div>
                    </div>

                    <div className="p-6 text-center space-y-4">
                        <div>
                            <span className={`text-[10px] font-bold ${isOffer ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'} uppercase tracking-widest px-2 py-1 rounded-full border`}>
                                {isOffer ? 'New Employee Perk' : 'Internal Announcement'}
                            </span>
                            <h2 className="text-xl font-bold text-white mt-3 truncate px-2">{data.title}</h2>
                            <p className="text-sm text-zinc-400 mt-1">{isOffer ? data.provider : 'From Admin'}</p>
                        </div>

                        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                            {isOffer ? (
                                <>
                                    <p className="text-2xl font-black text-white italic">{data.discount}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{data.description}</p>
                                </>
                            ) : (
                                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                    {data.message}
                                </p>
                            )}
                        </div>

                        {isOffer && data.eligibilityCriteria && (
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                                <HiOutlineShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                                <span>{data.eligibilityCriteria}</span>
                            </div>
                        )}

                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all group"
                        >
                            {isOffer ? 'Claim Now' : 'Got it'} <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GlobalPopup;
