import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { offersAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        discount: '',
        provider: '',
        validUntil: '',
        eligibilityCriteria: '',
    });

    useEffect(() => { loadOffers(); }, []);

    const loadOffers = async () => {
        try {
            const res = await offersAPI.getAll({ all: true });
            setOffers(res.data.offers || []);
        } catch (err) { console.error('Load offers error:', err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedOffer) {
                await offersAPI.update(selectedOffer._id, form);
            } else {
                await offersAPI.create(form);
            }
            setIsModalOpen(false);
            loadOffers();
        } catch (err) { alert(err.response?.data?.error || 'Action failed'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this offer?')) return;
        try {
            await offersAPI.deactivate(id);
            loadOffers();
        } catch (err) { console.error(err); }
    };

    const openModal = (offer = null) => {
        if (offer) {
            setSelectedOffer(offer);
            setForm({
                title: offer.title || '',
                description: offer.description || '',
                discount: offer.discount || '',
                provider: offer.provider || '',
                validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
                eligibilityCriteria: offer.eligibilityCriteria || '',
            });
        } else {
            setSelectedOffer(null);
            setForm({ title: '', description: '', discount: '', provider: '', validUntil: '', eligibilityCriteria: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20 px-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Corporate Perks</h1>
                    <p className="text-slate-500 mt-1 font-medium">Curate and manage exclusive benefits for the workforce.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, translateY: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal()}
                    className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all cursor-pointer shadow-xl shadow-slate-200"
                >
                    <HiOutlinePlus className="w-5 h-5 text-emerald-400" /> Draft New Offer
                </motion.button>
            </div>

            {loading ? (
                <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <motion.div
                            key={offer._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`bg-white border ${offer.isActive ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60 grayscale shadow-none'} rounded-[32px] p-8 space-y-6 group relative overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500`}
                        >
                            {!offer.isActive && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-tighter border border-slate-200">INACTIVE</div>
                            )}

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:rotate-6 transition-transform">
                                        <HiOutlineGift className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate max-w-[140px] group-hover:text-violet-600 transition-colors">{offer.title}</h4>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{offer.provider}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-inner relative z-10">
                                <p className="text-2xl font-black text-violet-600 italic tracking-tighter">{offer.discount}</p>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-medium leading-relaxed leading-relaxed">{offer.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto relative z-10">
                                <div className="flex items-center gap-2">
                                    <HiOutlineClock className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'LIFETIME'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(offer)} className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer border border-slate-100">
                                        <HiOutlinePencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(offer._id)} className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border border-slate-100">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {offers.length === 0 && (
                        <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-[40px] py-24 text-center">
                            <HiOutlineGift className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black italic tracking-tight">Launch your first corporate perk to motivate the team.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedOffer ? 'Campaign Editor' : 'Launch New Campaign'} maxWidth="max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offer Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                required
                                placeholder="e.g. Amazon Prime"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Partner</label>
                            <input
                                type="text"
                                value={form.provider}
                                onChange={e => setForm({ ...form, provider: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                placeholder="e.g. Amazon India"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vantage Point (Discount Statement)</label>
                        <input
                            type="text"
                            value={form.discount}
                            onChange={e => setForm({ ...form, discount: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-violet-600 font-black italic focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                            placeholder="e.g. COMPLIMENTARY 1-YEAR SUBSCRIPTION"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-600 font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-none h-28"
                            placeholder="Explain the perks and how employees can claim them..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                            <input
                                type="date"
                                value={form.validUntil}
                                onChange={e => setForm({ ...form, validUntil: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Tier/Eligibility</label>
                            <input
                                type="text"
                                value={form.eligibilityCriteria}
                                onChange={e => setForm({ ...form, eligibilityCriteria: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                placeholder="e.g. All Permanent Staff"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl mt-4 hover:bg-violet-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 cursor-pointer"
                    >
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />
                        {selectedOffer ? 'Safeguard Changes' : 'Publish Opportunity Now'}
                    </motion.button>
                </form>
            </Modal>
        </div>
    );
};

export default Offers;
