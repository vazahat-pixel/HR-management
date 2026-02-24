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
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden w-full bg-slate-900/95 backdrop-blur-3xl border-t border-white/5 h-[75px] flex items-center shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between w-full h-full px-2 pb-2">
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300",
                                isActive ? "opacity-100" : "opacity-60"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-300",
                                isActive ? "bg-[#C46A2D]/10 text-[#C46A2D]" : "text-slate-400"
                            )}>
                                <Icon className="w-5 h-5 shrink-0" />
                            </div>

                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-tighter whitespace-nowrap",
                                isActive ? "text-[#C46A2D]" : "text-slate-500"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-indicator"
                                    className="absolute -top-1 w-6 h-1 bg-[#C46A2D] rounded-full"
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
