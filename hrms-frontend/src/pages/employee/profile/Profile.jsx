import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineUserCircle, HiOutlineMail, HiOutlinePhone,
    HiOutlineLocationMarker, HiPencil,
    HiOutlineBriefcase, HiOutlineLibrary, HiOutlineIdentification,
    HiOutlineUserGroup, HiCheckCircle, HiExclamationCircle
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
// Ensure Modal is imported correctly. If it was working before, keep it. 
// If not, we might need to fix the path or the component itself.
// Assuming Modal is at ../../../components/common/Modal
import Modal from '../../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { cn } from '../../../lib/utils'; // Use utility for class merging

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
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.updateProfile(profile);
            toast.success('Profile updated successfully!');
            setIsEditModalOpen(false);
            // Reload to sync context - simple and effective for now
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const isComplete = (field) => !!user?.[field];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-2 sm:px-4">
            {/* Profile Header */}
            <div className="relative group mt-4">
                <div className="h-40 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/20 relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>
                <div className="absolute -bottom-12 left-6 flex items-end">
                    <div className="w-28 h-28 rounded-3xl border-4 border-white bg-slate-50 flex items-center justify-center text-slate-300 shadow-2xl relative group/avatar overflow-hidden">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <HiOutlineUserCircle className="w-20 h-20" />
                        )}
                    </div>
                    <div className="mb-3 ml-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {user?.fullName || 'User'}
                            </h1>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all"
                            >
                                <HiPencil className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-1 inline-block">
                            {user?.role === 'admin' ? 'Administrator' : 'Employee Node'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Personal & Contact */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-5 shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Identity & Contact
                        </h3>
                        <HiOutlineMail className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="space-y-3">
                        <ProfileItem icon={HiOutlineMail} label="Email" value={user?.email} isComplete={isComplete('email')} />
                        <ProfileItem icon={HiOutlinePhone} label="Phone" value={user?.mobile} isComplete={isComplete('mobile')} />
                        <ProfileItem icon={HiOutlineUserGroup} label="Partner" value={user?.partnerName} isComplete={isComplete('partnerName')} />
                        <ProfileItem icon={HiOutlineLibrary} label="Hub Name" value={user?.hubName} isComplete={isComplete('hubName')} />
                    </div>
                </motion.div>

                {/* Professional & Governance */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-5 shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            Banking & KYC
                        </h3>
                        <HiOutlineIdentification className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="space-y-3">
                        <ProfileItem icon={HiOutlineBriefcase} label="Bank Account" value={user?.bankAccount} isComplete={isComplete('bankAccount')} />
                        <ProfileItem icon={HiOutlineLibrary} label="IFSC Code" value={user?.ifscCode} isComplete={isComplete('ifscCode')} />
                        <ProfileItem icon={HiOutlineIdentification} label="Aadhaar" value={user?.aadhaar} isComplete={isComplete('aadhaar')} />
                        <ProfileItem icon={HiOutlineIdentification} label="PAN Card" value={user?.pan} isComplete={isComplete('pan')} />
                    </div>
                </motion.div>

                {/* Location */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-3 shadow-sm md:col-span-2"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                            <HiOutlineLocationMarker className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Address</p>
                            <p className="text-slate-800 font-bold text-sm leading-relaxed">{user?.address || 'Address Not Provided'}</p>
                        </div>
                        {!isComplete('address') && (
                            <span className="shrink-0 text-rose-500 font-black text-[9px] uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                Missing
                            </span>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Profile"
            >
                <div className="p-1">
                    <form onSubmit={handleSaveProfile} className="space-y-5">
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
                                <InputGroup label="Aadhaar Number" value={profile.aadhaar} onChange={(val) => setProfile({ ...profile, aadhaar: val })} required />
                                <InputGroup label="PAN Number" value={profile.pan} onChange={(val) => setProfile({ ...profile, pan: val })} required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Address</label>
                                <textarea
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold resize-none h-20 placeholder:text-slate-300"
                                    placeholder="Enter full address"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-[11px] font-black text-slate-500 hover:text-slate-700 hover:bg-slate-100 uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.02] uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

const ProfileItem = ({ icon: Icon, label, value, isComplete }) => (
    <div className="flex items-center gap-3.5 group p-2 hover:bg-slate-50 rounded-xl transition-colors -mx-2">
        <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-all border shadow-sm shrink-0",
            isComplete ? "bg-white text-emerald-600 border-emerald-100/50" : "bg-slate-50 text-slate-300 border-slate-100"
        )}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={cn("text-xs font-bold tracking-tight truncate", !value && "text-slate-300 italic")}>
                {value || 'Required'}
            </p>
        </div>
        <div className="shrink-0">
            {isComplete ? (
                <HiCheckCircle className="w-5 h-5 text-emerald-500/80" />
            ) : (
                <HiExclamationCircle className="w-5 h-5 text-rose-400/80 animate-pulse" />
            )}
        </div>
    </div>
);

const InputGroup = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold placeholder:text-slate-300"
            placeholder={label}
        />
    </div>
);

export default Profile;
