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
        <div className="space-y-8 pb-24 px-4 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#C46A2D] to-[#A55522] rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-[#C46A2D]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <HiOutlineGift className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
                        <span className="text-[#C46A2D]">Elite</span>
                        <span className="italic">Perks</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Member Benefits</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-[#C46A2D] rounded-full animate-spin shadow-inner" />
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-[40px] shadow-sm">
                    <div className="w-20 h-20 bg-[#F9EBE0] rounded-full flex items-center justify-center mx-auto mb-6">
                        <HiOutlineGift className="w-10 h-10 text-[#C46A2D]/30" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active perks available</p>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Technical ledger currently empty. Check back soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers.map((offer, i) => (
                        <motion.div
                            key={offer._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white border border-[#DCDCDC]/60 rounded-[32px] p-8 space-y-6 group relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#C46A2D]/10 transition-all duration-500"
                        >
                            {/* Technical Grid Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C46A2D 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C46A2D]/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-[#C46A2D]/10 transition-colors" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-[#F9EBE0] rounded-2xl flex items-center justify-center text-[#C46A2D] shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 border border-[#C46A2D]/10">
                                        <HiOutlineGift className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#C46A2D] transition-colors leading-tight">{offer.title}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{offer.provider}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black py-1 px-3 bg-[#C46A2D] text-white rounded-full uppercase tracking-tighter">
                                    Active
                                </div>
                            </div>

                            <div className="bg-[#F9F9F9] rounded-[24px] p-6 border border-[#DCDCDC]/40 relative z-10 shadow-inner group-hover:bg-white transition-colors duration-500">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[#C46A2D] tracking-tighter">{offer.discount}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">OFF</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
                                    {offer.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10 border-t border-[#DCDCDC]/30 pt-4">
                                {offer.eligibilityCriteria && (
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <HiOutlineShieldCheck className="w-3.5 h-3.5 text-[#3F7D58]" />
                                        </div>
                                        <span>{offer.eligibilityCriteria}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                    <div className="w-5 h-5 rounded-full bg-[#F9EBE0] flex items-center justify-center">
                                        <HiOutlineClock className="w-3.5 h-3.5 text-[#C46A2D]" />
                                    </div>
                                    <span>Expires: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Permanent'}</span>
                                </div>
                            </div>

                            <button className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-[#C46A2D] transition-all duration-300 shadow-xl hover:shadow-[#C46A2D]/30 group/btn text-[13px] uppercase tracking-widest border-none">
                                Claim Reward <HiOutlineExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Offers;
