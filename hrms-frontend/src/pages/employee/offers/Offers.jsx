import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift, HiOutlineTicket, HiOutlineExternalLink } from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const Offers = () => {
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [claimedCode, setClaimedCode] = useState(null);

    const offers = [
        { id: 1, title: 'Corporate Gym Membership', description: "Get 50% off on annual Gold's Gym membership across all centers.", type: 'Health & Wellness', code: 'GYM50OFF' },
        { id: 2, title: 'Learning Allowance', description: "Claim up to ₹10,000 for verified online courses on Udemy or Coursera.", type: 'Learning', code: 'LEARN10K' },
        { id: 3, title: 'Health Insurance Top-up', description: "Add your parents to your health insurance plan at a discounted premium.", type: 'Insurance', code: 'FAMILYFIRST' },
        { id: 4, title: 'Movie Night', description: "Buy 1 Get 1 Free on movie tickets every Friday.", type: 'Entertainment', code: 'FRIFUN' }
    ];

    const handleOfferClick = (offer) => {
        setSelectedOffer(offer);
        setClaimedCode(null);
        setIsOfferModalOpen(true);
    };

    const handleClaim = () => {
        // Simulate API call
        setTimeout(() => {
            setClaimedCode(selectedOffer.code);
        }, 800);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Active Offers</h1>
                <p className="text-slate-400 text-sm mt-1">Exclusive perks and benefits for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 cursor-pointer"
                        onClick={() => handleOfferClick(item)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-lg">
                                <HiOutlineGift className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">{item.description}</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleOfferClick(item); }}
                                className="text-xs font-bold text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                Claim Offer &rarr;
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Offer Details Modal */}
            <Modal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                title="Offer Details"
            >
                {selectedOffer && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-zinc-800 rounded-2xl text-primary-500">
                                <HiOutlineGift className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedOffer.title}</h3>
                                <p className="text-sm text-zinc-400">{selectedOffer.type}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description & Terms</h4>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                {selectedOffer.description} <br /><br />
                                <span className="text-zinc-500 text-xs italic">
                                    * Terms and conditions apply. Offer valid until Dec 31, 2026.
                                </span>
                            </p>
                        </div>

                        {!claimedCode ? (
                            <button
                                onClick={handleClaim}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.02] cursor-pointer"
                            >
                                Claim Now
                            </button>
                        ) : (
                            <div className="text-center space-y-3 animate-in fade-in duration-500">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"></div>
                                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-1">Your Coupon Code</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <HiOutlineTicket className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-2xl font-mono font-bold text-white tracking-widest">{claimedCode}</h3>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Use this code at checkout on the partner website.
                                </p>
                                <button
                                    className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1 mx-auto"
                                    onClick={() => alert("Dummy Action: Redirecting to partner site...")}
                                >
                                    Visit Partner Site <HiOutlineExternalLink />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Offers;
