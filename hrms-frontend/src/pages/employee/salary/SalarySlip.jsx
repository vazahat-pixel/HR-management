import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCash,
    HiOutlineDownload,
    HiOutlineTrendingUp,
    HiOutlineDocumentText,
    HiOutlineRefresh
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { payrollAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';

const SalarySlip = () => {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        loadPayslips();
    }, []);

    const loadPayslips = async () => {
        try {
            const res = await payrollAPI.getPayslips();
            setPayslips(res.data.payslips || []);
        } catch (err) {
            console.error('Load payslips error:', err);
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

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Calculate latest summary
    const latest = payslips[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Salary Slips</h1>
                    <p className="text-slate-500 text-sm font-medium">View and download your monthly pay statements.</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <HiOutlineDocumentText className="w-6 h-6" />
                </div>
            </div>

            {/* Earnings Overview Card */}
            {latest && (
                <div className="p-8 rounded-[40px] bg-white border border-slate-200 relative overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <HiOutlineCash className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Latest Payout Credited</span>
                        </div>
                        <div className="flex items-end gap-3 mb-8">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">₹{latest.netPayable?.toLocaleString() || '0'}</h2>
                            <div className="flex flex-col mb-1">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                    <HiOutlineTrendingUp className="w-2.5 h-2.5" /> PAID
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 mt-1">{monthNames[(latest.month || 1) - 1]} {latest.year}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gross Earnings</p>
                                <p className="font-black text-slate-900 text-lg mt-1 tracking-tight">₹{latest.grossEarnings?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Deductions</p>
                                <p className="font-black text-rose-600 text-lg mt-1 tracking-tight">₹{latest.totalDeductions?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Statements</h2>
                </div>

                <div className="space-y-3">
                    {payslips.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl border-dashed">
                            <HiOutlineCash className="w-10 h-10 text-slate-100 mx-auto mb-2" />
                            <p className="text-slate-400 font-medium">No payouts recorded yet</p>
                        </div>
                    ) : (
                        payslips.map((payslip, i) => (
                            <motion.div
                                key={payslip._id || i}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleViewPayslip(payslip)}
                                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                        <HiOutlineDocumentText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                            {monthNames[(payslip.month || 1) - 1]} {payslip.year}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{payslip.paidDays || 0} Working Days</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">₹{payslip.netPayable?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDownload(payslip, i); }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${downloadingId === i
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-white shadow-sm'
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
            </div>

            {/* Payslip Detail Modal */}
            <Modal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                title="Payslip Details"
                maxWidth="max-w-xl"
            >
                {selectedPayslip && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement Period</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {monthNames[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{selectedPayslip.paidDays} Paid Days</span>
                                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{selectedPayslip.lopDays || 0} LOP Days</span>
                                </div>
                            </div>
                            <button onClick={() => handleDownload(selectedPayslip, -1)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">
                                <HiOutlineDownload className="w-4 h-4" /> Download PDF
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-2">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-1">Earnings</h4>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500 font-bold italic">Basic Pay</span>
                                    <span className="text-slate-900 font-black">₹{selectedPayslip.basic?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500 font-bold italic">Incentives ({selectedPayslip.deliveredCount || 0} del.)</span>
                                    <span className="text-slate-900 font-black">₹{selectedPayslip.incentives?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500 font-bold italic">Conveyance</span>
                                    <span className="text-slate-900 font-black">₹{selectedPayslip.conveyance?.toLocaleString() || '0'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-1">Deductions</h4>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500 font-bold italic">TDS (1%)</span>
                                    <span className="text-rose-600 font-black">- ₹{selectedPayslip.tds?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-slate-500 font-bold italic">Salary Advance</span>
                                    <span className="text-rose-600 font-black">- ₹{selectedPayslip.advance?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[24px] p-6 flex justify-between items-center shadow-xl shadow-emerald-500/20">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Net Payable Amount</span>
                                <span className="text-[10px] text-white/50 font-bold italic">Directly Deposited to Registered Bank Acc.</span>
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">₹{selectedPayslip.netPayable?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalarySlip;
