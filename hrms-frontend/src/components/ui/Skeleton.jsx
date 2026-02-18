import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Skeleton = ({ className, variant = 'rect' }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
                "bg-slate-200/60 relative overflow-hidden",
                variant === 'circle' ? 'rounded-full' : 'rounded-2xl',
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </motion.div>
    );
};

export const CardSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm space-y-4">
                <Skeleton className="w-12 h-12" variant="circle" />
                <div className="space-y-2">
                    <Skeleton className="w-1/2 h-3" />
                    <Skeleton className="w-3/4 h-8" />
                </div>
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ count = 5 }) => (
    <div className="space-y-4 pt-4">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-slate-50">
                <Skeleton className="w-10 h-10 shrink-0" variant="circle" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/3 h-3" />
                    <Skeleton className="w-1/2 h-2" />
                </div>
                <Skeleton className="w-16 h-4 rounded-full" />
            </div>
        ))}
    </div>
);

export default Skeleton;
