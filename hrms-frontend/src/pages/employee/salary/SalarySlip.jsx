import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCash,
    HiOutlineDownload,
    HiOutlineTrendingUp,
    HiOutlineDocumentText,
    HiOutlineRefresh,
    HiOutlineChatAlt2
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { payrollAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';

const SalarySlip = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('payouts'); // 'slips' or 'payouts'
    const [payslips, setPayslips] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [slipsRes, payoutsRes] = await Promise.all([
                payrollAPI.getEmployeeSalarySlips(),
                payrollAPI.getEmployeePayouts()
            ]);
            setPayslips(slipsRes.data.slips || []);
            setPayouts(payoutsRes.data.payouts || []);
        } catch (err) {
            console.error('Load data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payslip, index) => {
        setDownloadingId(index);
        try {
            const res = await payrollAPI.downloadPayslipPDF(payslip._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download payslip');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleViewPayslip = (payslip) => {
        setSelectedPayslip(payslip);
        setIsPayslipModalOpen(true);
    };

    const handleViewPayout = (payout) => {
        setSelectedPayout(payout);
        setIsPayoutModalOpen(true);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-[#C46A2D] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My Earnings</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Track your payout and salary history</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                    <HiOutlineCash className="w-6 h-6" />
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                    onClick={() => setActiveTab('payouts')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'payouts' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Monthly Reports
                </button>
                <button
                    onClick={() => setActiveTab('slips')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'slips' ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Salary Slips
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'payouts' ? (
                <div className="space-y-4">
                    {payouts.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] border-dashed">
                            <HiOutlineCash className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No payout reports found</p>
                        </div>
                    ) : (
                        payouts.map((payout, i) => (
                            <motion.div
                                key={payout._id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleViewPayout(payout)}
                                className="bg-white p-5 rounded-[32px] border border-slate-200 hover:border-black hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-black group-hover:text-white transition-all">
                                        <HiOutlineTrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-slate-900 group-hover:text-black transition-colors uppercase tracking-tight">
                                            {monthNames[(payout.month || 1) - 1]} {payout.year}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{payout.totalDeliveryCount || 0} Deliveries</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[11px] font-black text-[#3F7D58]">₹{payout.totalPayAmount?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-black group-hover:bg-slate-100 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {payslips.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-slate-200 rounded-[32px] border-dashed">
                            <HiOutlineDocumentText className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No salary slips generated yet</p>
                        </div>
                    ) : (
                        payslips.map((payslip, i) => (
                            <motion.div
                                key={payslip._id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleViewPayslip(payslip)}
                                className="bg-white p-5 rounded-[32px] border border-slate-200 hover:border-black hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-black group-hover:text-white transition-all">
                                        <HiOutlineDocumentText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                                            {monthNames[(payslip.month || 1) - 1]} {payslip.year}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{payslip.paidDays || 0} Paid Days</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[11px] font-black text-emerald-600">₹{payslip.netPayable?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDownload(payslip, i); }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${downloadingId === i
                                        ? 'bg-black text-white border-black'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-black hover:border-black hover:bg-white shadow-sm'
                                        }`}
                                >
                                    {downloadingId === i ? (
                                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <HiOutlineDownload className="w-5 h-5" />
                                    )}
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Payout Detail Modal - REWORKED FOR PREMIUM UI */}
            <Modal
                isOpen={isPayoutModalOpen}
                onClose={() => setIsPayoutModalOpen(false)}
                title="Monthly Performance Ledger"
                maxWidth="max-w-xl"
            >
                {selectedPayout && (
                    <div className="space-y-8 py-2">
                        {/* Summary Header Card */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/20">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full" />

                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Statement Period</p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none">
                                        {monthNames[(selectedPayout.month || 1) - 1]} <span className="text-emerald-400">{selectedPayout.year}</span>
                                    </h3>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        HUB: {selectedPayout.hub_name || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Net Disbursed</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">₹{selectedPayout.totalPayAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* High-Level Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total DEL</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{selectedPayout.totalDeliveryCount}</span>
                                <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[70%]" />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversion</span>
                                <span className="text-2xl font-black text-emerald-600 leading-none">{selectedPayout.conversion || '0%'}</span>
                                <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[85%]" />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Days</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{selectedPayout.workingDays}</span>
                                <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-orange-400 w-[100%]" />
                                </div>
                            </div>
                        </div>

                        {/* Metrics Breakdown Section */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* Operational Stats */}
                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-3 h-[3px] bg-emerald-500 rounded-full" />
                                    Operations
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Total Assigned</span>
                                        <span className="text-sm font-black text-slate-900">{selectedPayout.totalAssigned || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Normal Delivery</span>
                                        <span className="text-sm font-black text-slate-900">{selectedPayout.totalNormalDelivery || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-tight tracking-tight">SOPSY Delivered</span>
                                        <span className="text-sm font-black text-emerald-800">{selectedPayout.sopsyDelivered || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">GTNL/U2S Delivery</span>
                                        <span className="text-sm font-black text-slate-900">{(selectedPayout.gtnlDelivered || 0) + (selectedPayout.u2sShipment || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="space-y-5">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-3 h-[3px] bg-orange-500 rounded-full" />
                                    Financials
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">LMA Base Rate</span>
                                        <span className="text-sm font-black text-slate-900">₹{selectedPayout.lmaBaseRate || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Gross Payout</span>
                                        <span className="text-sm font-black text-slate-900">₹{selectedPayout.finalBasePayAmt?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1 text-rose-600">
                                        <span className="text-[11px] font-bold uppercase tracking-tight">TDS (1%)</span>
                                        <span className="text-sm font-black">- ₹{selectedPayout.tds}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 text-rose-700">
                                        <span className="text-[11px] font-black uppercase tracking-tight">Adjustments</span>
                                        <span className="text-sm font-black">- ₹{selectedPayout.advance || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks if any */}
                        {selectedPayout.remark && (
                            <div className="p-5 bg-amber-50/30 rounded-[28px] border border-amber-100/50 flex gap-4 items-center">
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                                    <HiOutlineChatAlt2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-0.5">Note from Accounts</p>
                                    <p className="text-[11px] text-amber-900 font-bold leading-relaxed">{selectedPayout.remark}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Payslip Detail Modal - REWORKED FOR PREMIUM UI */}
            <Modal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                title="Consolidated Salary Slip"
                maxWidth="max-w-xl"
            >
                {selectedPayslip && (
                    <div className="space-y-8 py-2">
                        {/* Header Period Card */}
                        <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Statement Period</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                                    {monthNames[(selectedPayslip.month || 1) - 1]} <span className="text-[#C46A2D]">{selectedPayslip.year}</span>
                                </h3>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        {selectedPayslip.paidDays} DAYS PAID
                                    </span>
                                    {selectedPayslip.lopDays > 0 && (
                                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                            {selectedPayslip.lopDays} LOP
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(selectedPayslip, -1)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                            >
                                <HiOutlineDownload className="w-5 h-5" /> EXPORT PDF
                            </button>
                        </div>

                        {/* Earnings & Deductions Grid */}
                        <div className="grid grid-cols-2 gap-12">
                            {/* Earnings Section */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-3 h-[3px] bg-emerald-500 rounded-full" />
                                    Earnings
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Basic Pay</span>
                                        <span className="text-sm font-black text-slate-900">₹{selectedPayslip.basic?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Incentives</span>
                                            <span className="text-[9px] font-black text-emerald-500">{selectedPayslip.deliveredCount || 0} DELIVERIES</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">₹{selectedPayslip.incentives?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Conveyance</span>
                                        <span className="text-sm font-black text-slate-900">₹{selectedPayslip.conveyance?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Section */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-3 h-[3px] bg-rose-500 rounded-full" />
                                    Deductions
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span className="text-[11px] font-bold uppercase tracking-tight">TDS (1%)</span>
                                        <span className="text-sm font-black">- ₹{selectedPayslip.tds?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span className="text-[11px] font-bold uppercase tracking-tight">Salary Advance</span>
                                        <span className="text-sm font-black">- ₹{selectedPayslip.advance?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Deductions</span>
                                        <span className="text-sm font-black text-rose-700">₹{((selectedPayslip.tds || 0) + (selectedPayslip.advance || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Net Amount Card - DARK THEME */}
                        <div className="relative overflow-hidden bg-emerald-600 rounded-[32px] p-10 flex justify-between items-center shadow-2xl shadow-emerald-600/20 group">
                            {/* Decorative Background Texture */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />

                            <div className="relative z-10">
                                <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.4em]">Net Salary Disbursed</span>
                                <p className="text-[10px] text-white/40 font-bold mt-2 tracking-wide">Credited to registered bank account.</p>
                            </div>
                            <div className="relative z-10 text-right">
                                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">₹{selectedPayslip.netPayable?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalarySlip;
