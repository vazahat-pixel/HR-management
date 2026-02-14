import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2 } from 'react-icons/hi';

const Feedback = () => {
    return (
        <div className="max-w-2xl mx-auto py-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 mx-auto mb-4">
                    <HiOutlineChatAlt2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Feedback & Suggestions</h1>
                <p className="text-slate-400 mt-2">We value your input. Help us improve the workplace.</p>
            </div>

            <form className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Subject</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600" placeholder="e.g. Office Environment" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Message</label>
                    <textarea className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600 h-32 resize-none" placeholder="Type your feedback here..."></textarea>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.preventDefault(); alert("Dummy Action: Feedback Submitted Successfully!"); }}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg shadow-lg shadow-primary-500/20 transition-all cursor-pointer"
                >
                    Submit Feedback
                </motion.button>
            </form>
        </div>
    );
};

export default Feedback;
