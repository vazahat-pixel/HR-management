import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const AnimatedBottomNav = ({ items }) => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const index = items.findIndex(item => location.pathname.startsWith(item.path));
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [location.pathname, items]);

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-auto">
            <div className="bg-slate-900/95 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-full border border-white/10 p-1.5 flex items-center justify-center gap-1.5 overflow-visible">
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex items-center justify-center h-12 rounded-full transition-all duration-700",
                                isActive ? "px-6" : "px-3"
                            )}
                        >
                            <div className="flex items-center gap-2.5 relative z-10 transition-all duration-500">
                                <Icon className={cn(
                                    "w-5 h-5 transition-all duration-300",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )} />

                                <AnimatePresence mode="popLayout" initial={false}>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25
                                            }}
                                            className="text-[11px] font-black text-white uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-pill-v2"
                                    className="absolute inset-0 bg-gradient-to-r from-[#C46A2D] to-[#E07B3A] rounded-full shadow-lg shadow-[#C46A2D]/20"
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25
                                    }}
                                />
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default AnimatedBottomNav;
