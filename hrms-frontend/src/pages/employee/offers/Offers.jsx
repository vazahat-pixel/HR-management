import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift, HiOutlineClock, HiOutlineShieldCheck, HiOutlineExternalLink } from 'react-icons/hi';
import { offersAPI } from '../../../services/api';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const res = await offersAPI.getAll();
            setOffers(res.data.offers || []);
        } catch (err) {
            console.error('Load offers error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-24 px-4">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20">
                    <HiOutlineGift className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Employee Perks</h1>
                <p className="text-slate-500 mt-2 font-medium">Exclusive corporate benefits and premium discounts designed for you.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin" />
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-[40px] shadow-inner">
                    <HiOutlineGift className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">No active perks at the moment. Stay tuned!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((offer, i) => (
                        <motion.div
                            key={offer._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white border border-slate-100 rounded-[40px] p-8 space-y-6 group relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-violet-500/10 transition-colors" />

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <HiOutlineGift className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-violet-600 transition-colors">{offer.title}</h4>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{offer.provider}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-[30px] p-6 border border-slate-100 relative z-10 shadow-inner">
                                <p className="text-3xl font-black text-violet-600 italic tracking-tighter group-hover:scale-105 transition-transform origin-left">{offer.discount}</p>
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed font-medium">
                                    {offer.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 relative z-10 border-t border-slate-50 pt-4">
                                {offer.eligibilityCriteria && (
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-black uppercase tracking-wider">
                                        <HiOutlineShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>{offer.eligibilityCriteria}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-black uppercase tracking-wider">
                                    <HiOutlineClock className="w-4 h-4 text-amber-500" />
                                    <span>Valid till: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Always Available'}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-600 transition-all duration-300 shadow-xl hover:shadow-violet-500/25 group/btn">
                                Claim Benefit Now <HiOutlineExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Offers;
