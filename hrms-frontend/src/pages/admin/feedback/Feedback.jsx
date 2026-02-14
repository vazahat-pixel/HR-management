import React from 'react';
import { motion } from 'framer-motion';

const Feedback = () => {
    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">Employee Feedback</h1>
            <div className="space-y-4">
                {[1, 2, 3].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">Office Environment</span>
                            <span className="text-xs text-slate-500">2 hours ago</span>
                        </div>
                        <p className="text-white mb-4 leading-relaxed">"The air conditioning in the design wing is a bit too cold. Could we adjust it slightly?"</p>
                        <button className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors">Mark as Resolved</button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Feedback;
