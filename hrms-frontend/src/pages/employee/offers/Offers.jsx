import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift } from 'react-icons/hi';

const Offers = () => {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Active Offers</h1>
                <p className="text-slate-400 text-sm mt-1">Exclusive perks and benefits for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                    <motion.div
                        key={item}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-lg">
                                <HiOutlineGift className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Corporate Gym Membership</h3>
                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">Get 50% off on annual Gold's Gym membership across all centers.</p>
                            <button className="text-xs font-bold text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors">Claim Offer &rarr;</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Offers;
