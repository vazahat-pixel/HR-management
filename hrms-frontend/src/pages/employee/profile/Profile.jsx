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

            {/* HERO SECTION - Professional Minimalist */}
            <div className="relative h-64 rounded-[48px] overflow-hidden shadow-2xl mx-2">
                <div className="absolute inset-0 bg-slate-900" />

                {/* Subtle Gradient Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C46A2D]/20 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-800 blur-[80px] rounded-full" />

                <div className="relative h-full flex flex-col justify-center px-10 z-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter">
                                    {user?.fullName || 'User Name'}
                                </h1>
                                <p className="text-[#C46A2D] text-[11px] font-black uppercase tracking-[0.3em] mt-1 italic">
                                    Professional Associate
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Employee ID</span>
                                    <span className="text-xs font-bold text-white tracking-widest">#{user?.fhrId || user?.empId || 'GEN-001'}</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Station</span>
                                    <span className="text-xs font-bold text-white">{user?.hubName || 'HQ'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar with Ring */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[32px] border-4 border-white/10 backdrop-blur-md overflow-hidden relative shadow-2xl rotate-3">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/20">
                                        <HiOutlineUserCircle className="w-20 h-20" />
                                    </div>
                                )}
                            </div>
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

            {/* PROFESSIONAL DETAILS */}
            <div className="mx-4 p-8 bg-white border border-slate-100 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                        Professional Profile
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <ProfileField label="Contact Number" value={user?.mobile} icon={HiOutlinePhone} />
                    <ProfileField label="Hub Unit" value={user?.hubName} icon={HiOutlineLibrary} />
                    <ProfileField label="Business Partner" value={user?.partnerName} icon={HiOutlineUserGroup} />
                    <ProfileField label="Base Location" value={user?.address} icon={HiOutlineLocationMarker} />
                </div>
            </div>

            {/* STATUTORY & BANKING */}
            <div className="mx-4 p-8 bg-white border border-slate-100 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-8">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-slate-900 rounded-full" />
                        Statutory & Banking
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <ProfileField label="Bank Account" value={user?.bankAccount} icon={HiOutlineCash} />
                    <ProfileField label="IFSC Code" value={user?.ifscCode} icon={HiOutlineLibrary} />
                    <ProfileField label="Aadhaar Card" value={user?.aadhaar} icon={HiOutlineIdentification} />
                    <ProfileField label="PAN Card" value={user?.pan} icon={HiOutlineDocumentText} />
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

const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className={cn(
            "text-sm font-bold text-slate-900 tracking-tight pl-5",
            !value && "text-slate-300 italic"
        )}>
            {value || 'Not Configured'}
        </p>
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
