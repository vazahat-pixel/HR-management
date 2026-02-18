// Premium Light Theme Colors
export const colors = {
    // Primary Accents
    primary: '#0F766E',        // Deep Teal
    accent: '#059669',         // Emerald
    highlight: '#B45309',      // Muted Gold

    // Text Colors
    textPrimary: '#0F172A',    // Slate 900
    textSecondary: '#475569',  // Slate 600
    textMuted: '#64748B',      // Slate 500

    // Backgrounds
    bgMain: '#F8FAFC',         // Slate 50
    bgCard: '#FFFFFF',         // White
    bgHover: '#F1F5F9',        // Slate 100

    // Status Colors
    success: '#059669',        // Emerald 600
    warning: '#D97706',        // Amber 600
    danger: '#BE123C',         // Rose 700
    info: '#0891B2',           // Cyan 600

    // Border Colors
    border: '#E2E8F0',         // Slate 200
    borderDark: '#CBD5E1',     // Slate 300
};

// Premium Button Styles
export const buttonStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md',
    secondary: 'bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md',
    outline: 'border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold px-4 py-2.5 rounded-lg transition-all duration-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300',
    ghost: 'text-slate-700 hover:bg-slate-100 font-medium px-4 py-2.5 rounded-lg transition-all duration-200',
};

// Premium Input Styles
export const inputStyles = {
    base: 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none transition-all',
    withIcon: 'pl-10',
    error: 'border-rose-500 focus:ring-rose-500 focus:border-rose-600',
};

// Card Styles
export const cardStyles = {
    base: 'bg-white shadow-md border border-slate-200 rounded-xl p-6',
    hover: 'bg-white shadow-md border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300',
    compact: 'bg-white shadow-sm border border-slate-200 rounded-lg p-4',
};

// Badge Styles
export const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold',
    warning: 'bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold',
    danger: 'bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold',
    info: 'bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold',
    neutral: 'bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold',
};
