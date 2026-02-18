import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCash, HiOutlinePlay, HiOutlineDownload, HiOutlineEye, HiOutlineRefresh } from 'react-icons/hi';
import { payrollAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';

const SalaryManagement = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processResult, setProcessResult] = useState(null);

    useEffect(() => { loadPayslips(); }, [selectedMonth, selectedYear]);

    const loadPayslips = async () => {
        setLoading(true);
        try {
            const res = await payrollAPI.getPayslips({ month: selectedMonth, year: selectedYear });
            setPayslips(res.data.payslips || []);
        } catch (err) { console.error('Load payslips error:', err); }
        finally { setLoading(false); }
    };

    const handleRunPayroll = async () => {
        if (!confirm(`Run payroll for ${selectedMonth}/${selectedYear}? This will generate payslips for all active employees.`)) return;
        setProcessing(true);
        setProcessResult(null);
        try {
            const res = await payrollAPI.generateBulk({ month: selectedMonth, year: selectedYear });
            setProcessResult(res.data);
            loadPayslips();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to process payroll');
        } finally { setProcessing(false); }
    };

    const handleViewPayslip = (payslip) => {
        setSelectedPayslip(payslip);
        setShowPayslipModal(true);
    };

    const handleDownloadPDF = async (payslip) => {
        try {
            const res = await payrollAPI.downloadPayslipPDF(payslip._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Failed to download PDF'); }
    };

    const handleExportExcel = async () => {
        try {
            const res = await payrollAPI.downloadPayoutExcel({ month: selectedMonth, year: selectedYear });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payout_report_${selectedMonth}_${selectedYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Failed to export Excel'); }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalPayout = payslips.reduce((sum, p) => sum + (p.netPayable || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Payout</h1>
                    <p className="text-slate-500 text-sm font-medium">Payroll processing & payout management</p>
                </div>
                <div className="flex gap-2 items-center">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={handleExportExcel}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
                        <HiOutlineDownload className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={handleRunPayroll} disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer">
                        {processing ? <HiOutlineRefresh className="w-4 h-4 animate-spin" /> : <HiOutlinePlay className="w-4 h-4" />}
                        {processing ? 'Processing...' : 'Run Payroll'}
                    </button>
                </div>
            </div>

            {/* Payroll Result */}
            {processResult && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 font-bold">{processResult.message}</p>
                    <p className="text-xs text-emerald-600 mt-1">Processed: {processResult.processed} • Errors: {processResult.errors}</p>
                </motion.div>
            )}

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Payout</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">₹{totalPayout.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payslips Generated</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{payslips.length}</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Period</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{monthNames[selectedMonth - 1]} {selectedYear}</p>
                </div>
            </div>

            {/* Payslips Table */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /></div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-200 bg-slate-50">
                                {['Employee', 'ID', 'Basic', 'Deductions', 'Net Pay', 'Actions'].map(h => (
                                    <th key={h} className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider px-4 py-3">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {payslips.map(p => (
                                    <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{p.employeeName || p.userId?.fullName}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{p.employeeId || p.userId?.employeeId}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">₹{p.basic?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">₹{p.totalDeductions?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm font-bold text-emerald-700">₹{p.netPayable?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => handleViewPayslip(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDownloadPDF(p)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
                                                    <HiOutlineDownload className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {payslips.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-8 text-slate-500 text-sm font-medium">No payslips for this period. Run payroll to generate.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payslip Detail Modal */}
            <Modal isOpen={showPayslipModal} onClose={() => setShowPayslipModal(false)} title="Payslip Details" maxWidth="max-w-lg">
                {selectedPayslip && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                ['Employee', selectedPayslip.employeeName],
                                ['Employee ID', selectedPayslip.employeeId],
                                ['Period', `${monthNames[selectedPayslip.month - 1]} ${selectedPayslip.year}`],
                                ['Paid Days', selectedPayslip.paidDays],
                                ['LOP Days', selectedPayslip.lopDays || 0],
                                ['Base Rate', `₹${selectedPayslip.baseRate}`],
                            ].map(([l, v]) => (
                                <div key={l} className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">{l}</span>
                                    <span className="text-slate-900 font-medium">{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">Earnings</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Basic</span><span className="text-slate-900">₹{selectedPayslip.basic?.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Incentives ({selectedPayslip.deliveredCount || 0} del.)</span><span className="text-slate-900">₹{selectedPayslip.incentives?.toLocaleString() || '0'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Conveyance</span><span className="text-slate-900">₹{selectedPayslip.conveyance?.toLocaleString()}</span></div>
                                    <div className="flex justify-between font-bold border-t border-slate-100 pt-1 mt-2"><span className="text-slate-900">Gross</span><span className="text-slate-900">₹{selectedPayslip.grossEarnings?.toLocaleString()}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1">Deductions</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">TDS (1%)</span><span className="text-slate-900">₹{selectedPayslip.tds?.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Advance</span><span className="text-slate-900">₹{selectedPayslip.advance?.toLocaleString()}</span></div>
                                    <div className="flex justify-between font-bold border-t border-slate-100 pt-1 mt-2"><span className="text-slate-900">Total</span><span className="text-slate-900">₹{selectedPayslip.totalDeductions?.toLocaleString()}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center shadow-inner">
                            <span className="text-xs text-emerald-600 font-bold uppercase">Net Payable</span>
                            <span className="text-xl font-black text-emerald-700">₹{selectedPayslip.netPayable?.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalaryManagement;
