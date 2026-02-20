import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#BBBBBB]/60 backdrop-blur-md z-[100] transition-opacity"
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={`bg-white border border-[#DCDCDC] rounded-[28px] shadow-2xl w-full ${maxWidth} pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden`}
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCDCDC]/40 bg-[#F5F5F5] rounded-t-[28px]">
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-[#F9EBE0] text-slate-400 hover:text-[#C46A2D] transition-all cursor-pointer border border-transparent hover:border-[#F9EBE0]"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-0 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
