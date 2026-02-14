import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlineCheckCircle, HiOutlineUser } from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const Feedback = () => {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const feedbackItems = [
        { id: 1, type: 'Office Environment', time: '2 hours ago', content: "The air conditioning in the design wing is a bit too cold. Could we adjust it slightly?", author: "Anonymous", status: "Pending" },
        { id: 2, type: 'Management', time: '5 hours ago', content: "Great job on the new project rollout! The team feels very motivated.", author: "John Doe", status: "Resolved" },
        { id: 3, type: 'Cafeteria', time: '1 day ago', content: "Can we have more vegetarian options in the cafeteria menu?", author: "Sarah Smith", status: "Pending" }
    ];

    const handleFeedbackClick = (item) => {
        setSelectedFeedback(item);
        setIsFeedbackModalOpen(true);
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6">Employee Feedback</h1>
            <div className="space-y-4">
                {feedbackItems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
                        onClick={() => handleFeedbackClick(item)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">{item.type}</span>
                            <span className="text-xs text-slate-500">{item.time}</span>
                        </div>
                        <p className="text-white mb-4 leading-relaxed">"{item.content}"</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); alert("Dummy Action: Mark Feedback Resolved"); }}
                            className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            Mark as Resolved
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Feedback Details Modal */}
            <Modal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                title="Feedback Details"
            >
                {selectedFeedback && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                <HiOutlineUser className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{selectedFeedback.author}</h3>
                                <p className="text-xs text-zinc-500">{selectedFeedback.time} • {selectedFeedback.type}</p>
                            </div>
                            <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedFeedback.status === 'Resolved'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                {selectedFeedback.status}
                            </span>
                        </div>

                        <div className="p-4 bg-slate-950/50 rounded-xl border border-zinc-800">
                            <p className="text-zinc-300 italic">"{selectedFeedback.content}"</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Admin Response</h4>
                            <textarea
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary-500 min-h-[100px]"
                                placeholder="Type your response here..."
                            ></textarea>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    onClick={() => setIsFeedbackModalOpen(false)}
                                >
                                    Close
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                                    onClick={() => { alert("Dummy Action: Response Sent"); setIsFeedbackModalOpen(false); }}
                                >
                                    <HiOutlineChatAlt2 className="w-4 h-4" />
                                    Send Response
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Feedback;
