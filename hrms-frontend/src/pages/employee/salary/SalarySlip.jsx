import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineCash, HiOutlineDownload, HiOutlineTrendingUp,
    HiOutlineDocumentText, HiOutlineX, HiOutlineCheckCircle,
    HiOutlineCalendar, HiOutlineEye, HiOutlineRefresh
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import { payrollAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ─── Professional full-screen loader overlay ─────────────────────────────────
const DownloadOverlay = ({ label }) => (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 min-w-[240px]">
            {/* Animated ring */}
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#C46A2D] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#3F7D58] border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] [animation-duration:0.6s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <HiOutlineDownload className="w-5 h-5 text-[#C46A2D]" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black text-[#C46A2D] uppercase tracking-[0.3em] animate-pulse">{label || 'Preparing...'}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Please wait</p>
            </div>
        </div>
    </div>
);

// ─── Row spinner used inline on buttons ──────────────────────────────────────
const RowSpinner = () => (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const SalarySlip = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('payouts');
    const [payslips, setPayslips] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [downloadingSlipId, setDownloadingSlipId] = useState(null);
    const [downloadingPayoutId, setDownloadingPayoutId] = useState(null);
    const [showFullLoader, setShowFullLoader] = useState(false);
    const [loaderLabel, setLoaderLabel] = useState('');

    useEffect(() => { loadData(); }, []);

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
            console.error('Load error:', err);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    // ─── Salary Slip PDF Download ─────────────────────────────────────────────
    const handleDownloadSlip = async (payslip) => {
        if (downloadingSlipId) return;
        setDownloadingSlipId(payslip._id);
        setShowFullLoader(true);
        setLoaderLabel('Generating Salary Slip PDF...');
        const tid = toast.loading('Preparing your salary slip...');
        try {
            const res = await payrollAPI.downloadPayslipPDF(payslip._id);
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary_slip_${user?.fhrId}_${monthNames[(payslip.month || 1) - 1]}_${payslip.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Salary slip downloaded!', { id: tid });
        } catch (err) {
            toast.error('Download failed. Try again.', { id: tid });
        } finally {
            setDownloadingSlipId(null);
            setShowFullLoader(false);
        }
    };

    // ─── Payout PDF Download ──────────────────────────────────────────────────
    const handleDownloadPayout = async (payout) => {
        if (downloadingPayoutId) return;
        setDownloadingPayoutId(payout._id);
        setShowFullLoader(true);
        setLoaderLabel('Generating Payout Statement...');
        const tid = toast.loading('Preparing payout statement...');
        try {
            const res = await payrollAPI.downloadPayoutPDFById(payout._id);
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payout_${user?.fhrId}_${monthNames[(payout.month || 1) - 1]}_${payout.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Payout statement downloaded!', { id: tid });
        } catch (err) {
            toast.error('Download failed. Try again.', { id: tid });
        } finally {
            setDownloadingPayoutId(null);
            setShowFullLoader(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#C46A2D] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Loading Earnings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-24">
            {/* Full-screen download overlay */}
            <AnimatePresence>
                {showFullLoader && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DownloadOverlay label={loaderLabel} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My Earnings</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Payout & Salary History</p>
                </div>
                <button onClick={loadData} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 hover:text-[#C46A2D] transition-colors active:scale-95">
                    <HiOutlineRefresh className="w-5 h-5" />
                </button>
            </div>

            {/* Tab switcher */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
                {[{ key: 'payouts', label: 'Monthly Payouts', icon: HiOutlineCash },
                { key: 'slips', label: 'Salary Slips', icon: HiOutlineDocumentText }].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.key
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── PAYOUTS TAB ──────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'payouts' && (
                    <motion.div key="payouts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                        {payouts.length === 0 ? (
                            <EmptyState icon={HiOutlineCash} message="No payout records found." />
                        ) : payouts.map((payout, i) => (
                            <motion.div key={payout._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Top banner */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pay Period</p>
                                        <p className="text-sm font-black text-white">{monthNames[(payout.month || 1) - 1]}, {payout.year}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Pay</p>
                                        <p className="text-lg font-black text-[#C46A2D]">₹{payout.totalPayAmount?.toLocaleString('en-IN') || '0'}</p>
                                    </div>
                                </div>
                                {/* Stats row */}
                                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                                    <StatCell label="Working Days" value={payout.workingDays} />
                                    <StatCell label="Deliveries" value={payout.totalDeliveryCount} />
                                    <StatCell label="Conversion" value={payout.conversion || 'N/A'} />
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 p-3">
                                    <button onClick={() => setSelectedPayout(payout)}
                                        className="flex-1 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                                        <HiOutlineEye className="w-4 h-4" /> View Details
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPayout(payout)}
                                        disabled={!!downloadingPayoutId}
                                        className="flex-1 py-2.5 bg-[#C46A2D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#A55522] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                        {downloadingPayoutId === payout._id ? <RowSpinner /> : <HiOutlineDownload className="w-4 h-4" />}
                                        {downloadingPayoutId === payout._id ? 'Downloading...' : 'Download PDF'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ─── SALARY SLIPS TAB ─────────────────────────────────────── */}
                {activeTab === 'slips' && (
                    <motion.div key="slips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                        {payslips.length === 0 ? (
                            <EmptyState icon={HiOutlineDocumentText} message="No salary slips generated yet." />
                        ) : payslips.map((slip, i) => (
                            <motion.div key={slip._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Banner */}
                                <div className="bg-gradient-to-r from-[#3F7D58] to-[#2d5e40] px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-green-200 uppercase tracking-widest">Salary Slip</p>
                                        <p className="text-sm font-black text-white">{monthNames[(slip.month || 1) - 1]}, {slip.year}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-green-200 uppercase tracking-widest">Net Payable</p>
                                        <p className="text-lg font-black text-white">₹{slip.netPayable?.toLocaleString('en-IN') || '0'}</p>
                                    </div>
                                </div>
                                {/* Stats */}
                                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                                    <StatCell label="Paid Days" value={slip.paidDays} />
                                    <StatCell label="Basic" value={`₹${(slip.basic || 0).toLocaleString('en-IN')}`} />
                                    <StatCell label="Deductions" value={`₹${((slip.epfEmployee || 0) + (slip.esicEmployee || 0)).toLocaleString('en-IN')}`} color="text-rose-600" />
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 p-3">
                                    <button onClick={() => setSelectedPayslip(slip)}
                                        className="flex-1 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                                        <HiOutlineEye className="w-4 h-4" /> View Details
                                    </button>
                                    <button
                                        onClick={() => handleDownloadSlip(slip)}
                                        disabled={!!downloadingSlipId}
                                        className="flex-1 py-2.5 bg-[#3F7D58] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2d5e40] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                        {downloadingSlipId === slip._id ? <RowSpinner /> : <HiOutlineDownload className="w-4 h-4" />}
                                        {downloadingSlipId === slip._id ? 'Downloading...' : 'Download PDF'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── PAYOUT DETAIL MODAL ──────────────────────────────────── */}
            <Modal isOpen={!!selectedPayout} onClose={() => setSelectedPayout(null)} title="Payout Statement">
                {selectedPayout && (
                    <div className="p-1 space-y-4">
                        {/* Header card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedPayout.hub_name || 'Hub'}</p>
                            <h3 className="text-xl font-black mt-1">{selectedPayout.full_name || user?.fullName}</h3>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">{selectedPayout.fhrid}</p>
                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Period</p>
                                    <p className="text-sm font-black text-white">{monthNames[(selectedPayout.month || 1) - 1]} {selectedPayout.year}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-[#C46A2D] uppercase tracking-widest">Net Pay</p>
                                    <p className="text-2xl font-black text-[#C46A2D]">₹{selectedPayout.totalPayAmount?.toLocaleString('en-IN') || '0'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Operations */}
                        <Section title="Operations">
                            <Row label="Working Days" value={selectedPayout.workingDays} />
                            <Row label="Total Assigned" value={selectedPayout.totalAssigned} />
                            <Row label="Normal Deliveries" value={selectedPayout.totalNormalDelivery} />
                            <Row label="SOPSY Delivered" value={selectedPayout.sopsyDelivered} />
                            <Row label="GTNL Delivered" value={selectedPayout.gtnlDelivered} />
                            <Row label="U2S Shipments" value={selectedPayout.u2sShipment} />
                            <Row label="Total Delivery Count" value={selectedPayout.totalDeliveryCount} bold />
                            <Row label="Conversion" value={selectedPayout.conversion || 'N/A'} />
                        </Section>

                        {/* Financials */}
                        <Section title="Financials">
                            <Row label="LMA Base Pay" value={`₹${fmt(selectedPayout.lmaBasePayAmt)}`} />
                            <Row label="SOPSY Pay (18/P)" value={`₹${fmt(selectedPayout.sopsyBasePayAmt18P)}`} />
                            <Row label="GTNL Pay (6/P)" value={`₹${fmt(selectedPayout.gtnlBasePayAmt6P)}`} />
                            <Row label="Final Base Pay" value={`₹${fmt(selectedPayout.finalBasePayAmt)}`} bold />
                            <Row label="TDS (1%)" value={`-₹${fmt(selectedPayout.tds)}`} color="text-rose-600" />
                            <Row label="Advance" value={`-₹${fmt(selectedPayout.advance)}`} color="text-rose-600" />
                        </Section>

                        {/* Net Pay */}
                        <div className="bg-[#C46A2D] rounded-2xl px-4 py-3 flex items-center justify-between">
                            <p className="text-xs font-black text-white/80 uppercase tracking-widest">Total Net Pay</p>
                            <p className="text-xl font-black text-white">₹{selectedPayout.totalPayAmount?.toLocaleString('en-IN') || '0'}</p>
                        </div>

                        {/* Download */}
                        <button
                            onClick={() => { setSelectedPayout(null); handleDownloadPayout(selectedPayout); }}
                            disabled={!!downloadingPayoutId}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60">
                            <HiOutlineDownload className="w-4 h-4" /> Download PDF Statement
                        </button>
                    </div>
                )}
            </Modal>

            {/* ─── SALARY SLIP DETAIL MODAL ─────────────────────────────── */}
            <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title="Salary Slip">
                {selectedPayslip && (
                    <div className="p-1 space-y-4">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-[#2d5e40] to-[#1a3d28] rounded-2xl p-5 text-white">
                            <p className="text-[9px] font-black text-green-300 uppercase tracking-widest">Salary Slip</p>
                            <h3 className="text-xl font-black mt-1">{selectedPayslip.employeeName || user?.fullName}</h3>
                            <p className="text-[9px] text-green-300 font-bold mt-0.5">{selectedPayslip.fhrid} • {selectedPayslip.designation || 'N/A'}</p>
                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <p className="text-[9px] font-black text-green-300 uppercase tracking-widest">Pay Period</p>
                                    <p className="text-sm font-black">{monthNames[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}</p>
                                    <p className="text-[9px] text-green-300 mt-0.5">Paid Days: {selectedPayslip.paidDays}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-green-300 uppercase tracking-widest">Net Payable</p>
                                    <p className="text-2xl font-black">₹{selectedPayslip.netPayable?.toLocaleString('en-IN') || '0'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Earnings + Deductions side by side */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                <p className="text-[9px] font-black text-[#3F7D58] uppercase tracking-widest mb-3">Earnings</p>
                                <SlipRow label="Basic" value={`₹${fmt(selectedPayslip.basic)}`} />
                                <SlipRow label="Conveyance" value={`₹${fmt(selectedPayslip.conveyance)}`} />
                                <SlipRow label="HRA" value={`₹${fmt(selectedPayslip.hra)}`} />
                                <SlipRow label="Other Allow." value={`₹${fmt(selectedPayslip.otherAllowances)}`} />
                                <div className="border-t border-emerald-200 mt-2 pt-2">
                                    <SlipRow label="Gross" value={`₹${fmt((selectedPayslip.basic || 0) + (selectedPayslip.conveyance || 0) + (selectedPayslip.hra || 0) + (selectedPayslip.otherAllowances || 0))}`} bold />
                                </div>
                            </div>
                            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-3">Deductions</p>
                                <SlipRow label="EPF (Emp)" value={`₹${fmt(selectedPayslip.epfEmployee)}`} color="text-rose-600" />
                                <SlipRow label="ESIC (Emp)" value={`₹${fmt(selectedPayslip.esicEmployee)}`} color="text-rose-600" />
                                <SlipRow label="EPF (Emp)" value={`₹${fmt(selectedPayslip.epfEmployer)}`} color="text-rose-600" />
                                <SlipRow label="Other Ded." value={`₹${fmt(selectedPayslip.otherDeductions)}`} color="text-rose-600" />
                                <div className="border-t border-rose-200 mt-2 pt-2">
                                    <SlipRow label="Total" value={`₹${fmt((selectedPayslip.epfEmployee || 0) + (selectedPayslip.esicEmployee || 0) + (selectedPayslip.otherDeductions || 0))}`} bold color="text-rose-600" />
                                </div>
                            </div>
                        </div>

                        {/* Bank details */}
                        {(selectedPayslip.accountNumber || selectedPayslip.ifscCode) && (
                            <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center border border-slate-100">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                                    <p className="text-xs font-bold text-slate-900">{selectedPayslip.accountNumber || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IFSC</p>
                                    <p className="text-xs font-bold text-slate-900">{selectedPayslip.ifscCode || 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {/* Net Pay */}
                        <div className="bg-[#3F7D58] rounded-2xl px-4 py-3 flex items-center justify-between">
                            <p className="text-xs font-black text-white/80 uppercase tracking-widest">Net Payable</p>
                            <p className="text-xl font-black text-white">₹{selectedPayslip.netPayable?.toLocaleString('en-IN') || '0'}</p>
                        </div>

                        {/* Download */}
                        <button
                            onClick={() => { setSelectedPayslip(null); handleDownloadSlip(selectedPayslip); }}
                            disabled={!!downloadingSlipId}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60">
                            <HiOutlineDownload className="w-4 h-4" /> Download Salary Slip PDF
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-dashed border-slate-200">
        <Icon className="w-10 h-10 text-slate-200" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
);

const StatCell = ({ label, value, color = 'text-slate-900' }) => (
    <div className="py-2.5 px-3 text-center">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-black mt-0.5 ${color}`}>{value ?? '—'}</p>
    </div>
);

const Section = ({ title, children }) => (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
        <div className="divide-y divide-slate-100">{children}</div>
    </div>
);

const Row = ({ label, value, bold, color }) => (
    <div className="flex items-center justify-between px-4 py-2">
        <p className={`text-xs ${bold ? 'font-black text-slate-900' : 'font-medium text-slate-500'}`}>{label}</p>
        <p className={`text-xs font-black ${color || (bold ? 'text-slate-900' : 'text-slate-700')}`}>{value ?? '—'}</p>
    </div>
);

const SlipRow = ({ label, value, bold, color }) => (
    <div className="flex justify-between items-center py-0.5">
        <p className={`text-[9px] ${bold ? 'font-black' : 'font-medium'} text-slate-500`}>{label}</p>
        <p className={`text-[9px] font-black ${color || 'text-slate-800'}`}>{value}</p>
    </div>
);

export default SalarySlip;
