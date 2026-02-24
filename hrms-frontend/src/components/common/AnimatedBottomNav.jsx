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
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden w-full bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 h-[65px] flex items-center shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around w-full h-full px-2">
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group"
                        >
                            <div className="relative flex flex-col items-center justify-center w-full h-full">
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-x-1 inset-y-2 bg-[#C46A2D]/5 rounded-xl z-0"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}

                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        y: isActive ? -1 : 0
                                    }}
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10",
                                        isActive
                                            ? "bg-gradient-to-r from-[#C46A2D] to-[#A55522] text-white shadow-md shadow-[#C46A2D]/20"
                                            : "text-slate-400 group-hover:text-slate-600"
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                </motion.div>

                                <motion.span
                                    animate={{
                                        opacity: isActive ? 1 : 0.6
                                    }}
                                    className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter relative z-10 mt-0.5",
                                        isActive ? "text-[#C46A2D]" : "text-slate-400"
                                    )}
                                >
                                    {item.label}
                                </motion.span>
                            </div>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default AnimatedBottomNav;
