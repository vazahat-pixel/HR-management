import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiPencil, HiCamera } from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const Profile = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Alex Morgan',
        role: 'Senior Developer',
        email: 'alex.morgan@company.com',
        phone: '+1 (555) 000-1234',
        location: 'San Francisco, CA'
    });

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsEditModalOpen(false);
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-48 w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-800/[0.2] bg-[length:32px_32px]" />
                </div>
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-slate-600 shadow-2xl cursor-pointer hover:bg-slate-700 transition-colors relative group/avatar"
                        onClick={() => setIsAvatarModalOpen(true)}
                    >
                        <HiOutlineUserCircle className="w-20 h-20" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-xl">
                            <HiCamera className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    <div className="mb-4 ml-6">
                        <div className="flex items-center gap-2">
                            <h1
                                className="text-3xl font-bold text-white cursor-pointer hover:text-primary-400 transition-colors"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                {profile.name}
                            </h1>
                            <button onClick={() => setIsEditModalOpen(true)} className="text-zinc-500 hover:text-white transition-colors">
                                <HiPencil className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-primary-400 font-medium tracking-wide">{profile.role}</p>
                    </div>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                        <h3 className="text-lg font-bold text-white">Personal Details</h3>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-xs font-bold text-primary-500 hover:text-primary-400 uppercase tracking-widest"
                        >
                            Edit
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlineMail className="w-5 h-5 text-slate-500" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlinePhone className="w-5 h-5 text-slate-500" />
                            <span>{profile.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <HiOutlineLocationMarker className="w-5 h-5 text-slate-500" />
                            <span>{profile.location}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-slate-900 border border-slate-800 rounded-xl"
                >
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Work Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Employee ID</p>
                            <p className="text-white font-mono mt-1">EMP-2024-045</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Department</p>
                            <p className="text-white mt-1">Engineering</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Date Joined</p>
                            <p className="text-white mt-1">Aug 12, 2023</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Reports To</p>
                            <p className="text-white mt-1">Sarah Connor</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profile"
            >
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                            type="text"
                            defaultValue={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            defaultValue={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Location</label>
                        <input
                            type="text"
                            defaultValue={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.02]"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Avatar Modal */}
            <Modal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                title="Update Profile Picture"
                maxWidth="max-w-sm"
            >
                <div className="space-y-6 text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-zinc-800 transition-colors group">
                        <HiCamera className="w-8 h-8 text-zinc-500 group-hover:text-primary-500 transition-colors" />
                        <span className="text-xs text-zinc-500 font-medium group-hover:text-zinc-300">Upload Photo</span>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsAvatarModalOpen(false)}
                            className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest"
                        >
                            Remove Current Photo
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
