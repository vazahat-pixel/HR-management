import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineUserCircle, HiOutlineMail, HiOutlinePhone,
    HiOutlineLocationMarker, HiPencil,
    HiOutlineBriefcase, HiOutlineLibrary, HiOutlineIdentification,
    HiOutlineUserGroup, HiCheckCircle, HiExclamationCircle,
    HiOutlineDocumentText, HiOutlineCash, HiOutlineCalendar, HiOutlineBell,
    HiChevronRight
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        mobile: '',
        address: '',
        partnerName: '',
        hubName: '',
        bankAccount: '',
        ifscCode: '',
        aadhaar: '',
        pan: ''
    });

    useEffect(() => {
        if (user) {
            setProfile({
                fullName: user.fullName || '',
                email: user.email || '',
                mobile: user.mobile || '',
                address: user.address || '',
                partnerName: user.partnerName || '',
                hubName: user.hubName || '',
                bankAccount: user.bankAccount || '',
                ifscCode: user.ifscCode || '',
                aadhaar: user.aadhaar || '',
                pan: user.pan || ''
            });

            // Show persistent nudge if profile is incomplete
            if (user.role === 'employee' && user.isProfileCompleted === false) {
                toast((t) => (
                    <div className="flex flex-col gap-1 pr-2">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                            <HiExclamationCircle className="w-4 h-4 text-orange-600" />
                            Activation Protocol Required
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 leading-tight">
                            Complete your professional profile below to authorize and unlock all system features.
                        </span>
                    </div>
                ), {
                    id: 'profile-nudge',
                    duration: 6000,
                    style: {
                        borderRadius: '20px',
                        background: '#FFF',
                        color: '#333',
                        border: '1px solid #F1F5F9',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                    }
                });
            }
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.updateProfile(profile);
            toast.success('Profile updated successfully!');
            setIsEditModalOpen(false);
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const isComplete = (field) => !!user?.[field];

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12 pt-4">
            {/* INCOMPLETE PROFILE WARNING */}
            {user?.isProfileCompleted === false && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 p-5 bg-orange-50 border border-orange-200 rounded-[28px] flex items-start gap-4 shadow-sm"
                >
                    <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                        <HiExclamationCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-orange-900 uppercase tracking-widest mt-0.5">Profile Activation Pending</h4>
                        <p className="text-[10px] text-orange-700/80 font-bold leading-relaxed mt-1">
                            Your account is restricted. Please fill in all required fields below (Aadhaar, PAN, Bank Details) and click "Save Changes" to unlock your dashboard and payslips.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* HERO SECTION - Premium Gradient */}
            <div className="relative h-72 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#C46A2D]/80" />

                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                <div className="relative h-full flex flex-col justify-center px-8 z-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
                                {user?.fullName || 'User Name'}
                            </h1>
                            <div className="inline-flex items-center px-4 py-1.5 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                                {user?.designation || 'Delivery Associate'}
                            </div>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">
                                FHRID: {user?.empId || '54823901'}
                            </p>
                        </div>

                        {/* Avatar with Glow */}
                        <div className="relative">
                            <motion.div
                                animate={{ boxShadow: ['0 0 20px rgba(255,255,255,0.2)', '0 0 40px rgba(255,255,255,0.4)', '0 0 20px rgba(255,255,255,0.2)'] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="w-28 h-28 rounded-full border-4 border-white/30 backdrop-blur-md overflow-hidden relative shadow-2xl"
                            >
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/20">
                                        <HiOutlineUserCircle className="w-20 h-20" />
                                    </div>
                                )}
                            </motion.div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute bottom-1 -right-1 w-8 h-8 bg-white text-orange-500 rounded-full flex items-center justify-center shadow-xl border-2 border-slate-900 group/edit transition-transform active:scale-90"
                            >
                                <HiPencil className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CORE DATA - GLASSMORPHISM CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative -mt-16 mx-4 z-20 group"
            >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] group-hover:-translate-y-1" />

                <div className="relative p-6 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-black/5">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Node</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">HUB: {user?.hubName || 'Base Station'}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                            <HiChevronRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0">
                                <HiOutlinePhone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.mobile || 'Connect Number'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0">
                                <HiOutlineMail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0">
                                <HiOutlineBriefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined</p>
                                <p className="text-xs font-bold text-slate-900">05 Jan, 2024</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0">
                                <HiOutlineUserGroup className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Partner</p>
                                <p className="text-xs font-bold text-slate-900">{user?.partnerName || 'Required'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* IDENTITY & CONTACT MODULE */}
            <div className="mx-4 p-8 bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
                        Identity & Contact
                    </h3>
                    <HiOutlineMail className="w-5 h-5 text-slate-200" />
                </div>

                <div className="space-y-4">
                    <ProfileItem
                        icon={HiOutlineMail}
                        label="Email Address"
                        value={user?.email}
                        isComplete={isComplete('email')}
                        color="bg-slate-50"
                    />
                    <ProfileItem
                        icon={HiOutlinePhone}
                        label="Mobile Network"
                        value={user?.mobile}
                        isComplete={isComplete('mobile')}
                    />
                    <ProfileItem
                        icon={HiOutlineLocationMarker}
                        label="Base Address"
                        value={user?.address}
                        isComplete={isComplete('address')}
                    />
                </div>
            </div>

            {/* QUICK ACTIONS - GRID */}
            <div className="mx-4 space-y-6 pb-20">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] pl-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
                    Quick Actions
                </h3>

                <div className="grid grid-cols-4 gap-4 px-2">
                    <ActionCard icon={HiOutlineDocumentText} label="Payslip" to="/employee/salary" delay={0.1} />
                    <ActionCard icon={HiOutlineCash} label="Payouts" to="/employee/salary" delay={0.2} />
                    <ActionCard icon={HiOutlineCalendar} label="Attendance" to="/employee/dashboard" delay={0.3} />
                    <ActionCard icon={HiOutlineBell} label="Notices" to="/employee/dashboard" delay={0.4} />
                </div>
            </div>

            {/* Edit Modal (Preserved Context) */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Profile Node"
            >
                <form onSubmit={handleSaveProfile} className="space-y-5 p-2">
                    <div className="grid grid-cols-1 gap-4">
                        <InputGroup label="Full Name" value={profile.fullName} onChange={(val) => setProfile({ ...profile, fullName: val })} required />
                        <InputGroup label="Email ID" value={profile.email} onChange={(val) => setProfile({ ...profile, email: val })} type="email" required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Mobile" value={profile.mobile} onChange={(val) => setProfile({ ...profile, mobile: val })} required />
                            <InputGroup label="Partner Name" value={profile.partnerName} onChange={(val) => setProfile({ ...profile, partnerName: val })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Hub Name" value={profile.hubName} onChange={(val) => setProfile({ ...profile, hubName: val })} required />
                            <InputGroup label="IFSC Code" value={profile.ifscCode} onChange={(val) => setProfile({ ...profile, ifscCode: val })} required />
                        </div>
                        <InputGroup label="Bank Account" value={profile.bankAccount} onChange={(val) => setProfile({ ...profile, bankAccount: val })} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Aadhaar" value={profile.aadhaar} onChange={(val) => setProfile({ ...profile, aadhaar: val })} required />
                            <InputGroup label="PAN" value={profile.pan} onChange={(val) => setProfile({ ...profile, pan: val })} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Base Address</label>
                            <textarea
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold resize-none h-24"
                                placeholder="Full residential address"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Cancel</button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all">{loading ? 'Syncing...' : 'Save Changes'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const ProfileItem = ({ icon: Icon, label, value, isComplete }) => (
    <div className="flex items-center gap-4 group p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 rounded-3xl border border-transparent hover:border-slate-100 transition-all duration-300">
        <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center transition-all border shadow-sm",
            isComplete ? "bg-white text-orange-500 border-orange-100" : "bg-white text-slate-300 border-slate-100"
        )}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={cn("text-xs font-bold tracking-tight truncate", !value && "text-slate-300 italic")}>
                {value || 'Missing Required Information'}
            </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
            {isComplete ? (
                <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                    <HiCheckCircle className="w-4 h-4" />
                </div>
            ) : (
                <div className="w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-sm animate-pulse">
                    <HiExclamationCircle className="w-4 h-4" />
                </div>
            )}
            <div className="p-2 bg-slate-100/50 rounded-xl text-slate-300">
                <HiChevronRight className="w-4 h-4" />
            </div>
        </div>
    </div>
);

const ActionCard = ({ icon: Icon, label, to, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
    >
        <Link
            to={to}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_45px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 active:scale-95 touch-manipulation group"
        >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{label}</span>
        </Link>
    </motion.div>
);

const InputGroup = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold placeholder:text-slate-300"
            placeholder={label}
        />
    </div>
);

export default Profile;
