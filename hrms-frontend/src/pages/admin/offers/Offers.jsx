import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus } from 'react-icons/hi';

const Offers = () => {
    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Manage Offers</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary-500/20">
                    <HiOutlinePlus className="w-5 h-5" />
                    New Offer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="group p-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full transition-transform group-hover:scale-125" />
                        <h3 className="text-lg font-bold text-white">Gym Membership Discount</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-4">50% off at Gold's Gym</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-slate-800 text-xs text-white rounded font-medium hover:bg-slate-700">Edit</button>
                            <button className="px-3 py-1 bg-red-500/10 text-xs text-red-500 rounded font-medium hover:bg-red-500/20">Deactivate</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Offers;
