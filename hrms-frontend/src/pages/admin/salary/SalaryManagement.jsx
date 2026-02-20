import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCash, HiOutlinePlay, HiOutlineDownload, HiOutlineEye, HiOutlineRefresh, HiOutlineUpload, HiOutlineCheckCircle } from 'react-icons/hi';
import { payrollAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';

const SalaryManagement = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [uploading, setUploading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState(null);

    useEffect(() => { loadPayouts(); }, [selectedMonth, selectedYear]);

    const loadPayouts = async () => {
        setLoading(true);
        try {
            const res = await payrollAPI.getPayoutReport({ month: selectedMonth, year: selectedYear });
            setPayouts(res.data.payouts || []);
        } catch (err) { console.error('Load payouts error:', err); }
        finally { setLoading(false); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadSummary(null);
        try {
            const res = await payrollAPI.uploadPayout(formData, { month: selectedMonth, year: selectedYear });
            setUploadSummary(res.data.summary);
            toast.success('Payout data processed!');
            loadPayouts();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
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
        } catch (err) { toast.error('Failed to export Excel'); }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalPayout = payouts.reduce((sum, p) => sum + (p.totalPayAmount || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Monthly Payout</h1>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                        Process & Manage Salaries
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-white border border-[#DCDCDC] rounded-xl overflow-hidden shadow-sm">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent px-4 py-2.5 text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none border-r border-[#DCDCDC] cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent px-4 py-2.5 text-[11px] font-black text-slate-900 tracking-widest outline-none cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Bulk Payout Upload */}
                    <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-sm ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900 border border-[#DCDCDC] hover:bg-black hover:text-white'}`}>
                        <HiOutlineUpload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
                        {uploading ? 'Processing...' : 'Bulk Upload'}
                        <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" accept=".xlsx" />
                    </label>

                    <button onClick={handleExportExcel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-500 hover:text-[#C46A2D] border border-[#DCDCDC] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95">
                        <HiOutlineDownload className="w-4 h-4" /> Download Excel
                    </button>
                </div>
            </div>

            {/* Upload Summary Card */}
            {uploadSummary && (
                <div className="bg-white border border-[#DCDCDC] p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-l-[#C46A2D]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F9EBE0] rounded-2xl flex items-center justify-center text-[#C46A2D]">
                            <HiOutlineCheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[14px] font-black text-slate-900 uppercase">Payout Process Completed</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Master Ledger Synchronized</p>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xl font-black text-slate-900">{uploadSummary.total}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-[#3F7D58] uppercase tracking-widest mb-1">Success</p>
                            <p className="text-xl font-black text-[#3F7D58]">{uploadSummary.success}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-[#B23A48] uppercase tracking-widest mb-1">Failed</p>
                            <p className="text-xl font-black text-[#B23A48]">{uploadSummary.failed}</p>
                        </div>
                    </div>
                    {uploadSummary.skippedFhrids.length > 0 && (
                        <div className="bg-slate-50 px-4 py-2 rounded-xl max-h-20 overflow-y-auto min-w-[150px]">
                            <p className="text-[8px] font-black text-[#B23A48] uppercase mb-1">Skipped FHRIDs (Invalid)</p>
                            <div className="flex flex-wrap gap-1">
                                {uploadSummary.skippedFhrids.map(id => (
                                    <span key={id} className="text-[9px] font-bold text-slate-500 bg-white border border-[#DCDCDC] px-1.5 rounded">{id}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Managed Liquidity', value: `₹${totalPayout.toLocaleString()}`, icon: <HiOutlineCash />, color: 'text-[#C46A2D]' },
                    { label: 'Total Records [Excel Source]', value: payouts.length, icon: <HiOutlineDownload />, color: 'text-slate-900' },
                    { label: 'Active Fiscal Period', value: `${monthNames[selectedMonth - 1]} ${selectedYear}`, icon: <HiOutlineRefresh />, color: 'text-slate-900' },
                ].map((card, i) => (
                    <div key={i} className="bg-white border border-[#DCDCDC] rounded-[28px] p-6 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</span>
                            <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-slate-300 group-hover:text-[#C46A2D] transition-colors">
                                {card.icon}
                            </div>
                        </div>
                        <p className={`text-[28px] font-black tracking-tighter ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Payslips Table */}
            {loading ? (
                <div className="bg-white border border-[#DCDCDC] rounded-[32px] py-32 text-center">
                    <div className="w-10 h-10 border-[3px] border-[#F5F5F5] border-t-[#C46A2D] rounded-full animate-spin mx-auto" />
                    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Ledger...</p>
                </div>
            ) : (
                <div className="bg-white border border-[#DCDCDC]/60 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5] border-b border-[#DCDCDC]/60">
                                    <th className="sticky left-0 z-10 bg-[#F5F5F5] text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4 min-w-[150px]">Member Name</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">FHRID</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">HUB</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Days</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Assigned</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Normal Del</th>
                                    <th className="text-left text-[9px] font-black text-orange-500 uppercase tracking-widest px-6 py-4 bg-orange-50/50">SOPSY</th>
                                    <th className="text-left text-[9px] font-black text-blue-500 uppercase tracking-widest px-6 py-4 bg-blue-50/50">GTNL</th>
                                    <th className="text-left text-[9px] font-black text-purple-500 uppercase tracking-widest px-6 py-4 bg-purple-50/50">U2S</th>
                                    <th className="text-left text-[9px] font-black text-slate-900 uppercase tracking-widest px-6 py-4 bg-slate-100/50">Total Del</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Conv. %</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4 border-l border-[#DCDCDC]/60">LMA Rate</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Base Payout</th>
                                    <th className="text-left text-[9px] font-black text-[#B23A48] uppercase tracking-widest px-6 py-4">TDS (1%)</th>
                                    <th className="text-left text-[9px] font-black text-[#B23A48] uppercase tracking-widest px-6 py-4">Advance</th>
                                    <th className="text-left text-[9px] font-black text-[#3F7D58] uppercase tracking-widest px-6 py-4 border-l border-[#DCDCDC]/60 shadow-[inset_4px_0_10px_-4px_rgba(0,0,0,0.05)]">Final Payout</th>
                                    <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Remark</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCDCDC]/40">
                                {payouts.map(p => (
                                    <tr key={p._id} className="hover:bg-[#F5F5F5]/30 transition-colors group">
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-[#F5F5F5]/50 px-6 py-4 border-r border-[#DCDCDC]/40">
                                            <p className="text-[12px] text-slate-900 font-extrabold uppercase tracking-tight truncate max-w-[140px]">{p.full_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{p.profileId || '--'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{p.fhrid}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate max-w-[100px] block">{p.hub_name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[12px] text-slate-600 font-black whitespace-nowrap">{p.workingDays}</td>
                                        <td className="px-6 py-4 text-[12px] text-slate-600 font-bold">{p.totalAssigned}</td>
                                        <td className="px-6 py-4 text-[12px] text-slate-600 font-bold">{p.totalNormalDelivery}</td>
                                        <td className="px-6 py-4 text-[12px] text-orange-600 font-black bg-orange-50/20">{p.sopsyDelivered}</td>
                                        <td className="px-6 py-4 text-[12px] text-blue-600 font-black bg-blue-50/20">{p.gtnlDelivered}</td>
                                        <td className="px-6 py-4 text-[12px] text-purple-600 font-black bg-purple-50/20">{p.u2sShipment}</td>
                                        <td className="px-6 py-4 text-[12px] text-slate-900 font-black bg-slate-50/30">{p.totalDeliveryCount}</td>
                                        <td className="px-6 py-4 text-[11px] text-slate-500 font-bold">{p.conversion || '0%'}</td>
                                        <td className="px-6 py-4 text-[11px] text-slate-500 font-bold border-l border-[#DCDCDC]/40">₹{p.lmaBaseRate}</td>
                                        <td className="px-6 py-4 text-[11px] text-slate-500 font-bold">₹{p.finalBasePayAmt?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[11px] text-[#B23A48] font-bold">₹{p.tds}</td>
                                        <td className="px-6 py-4 text-[11px] text-[#B23A48] font-bold">₹{p.advance}</td>
                                        <td className="px-6 py-4 border-l border-[#DCDCDC]/40 bg-[#3F7D58]/5 shadow-[inset_4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                            <span className="text-[13px] font-black text-[#3F7D58]">₹{p.totalPayAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[150px]">{p.remark || '--'}</p>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr><td colSpan={20} className="text-center py-20">
                                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] italic">LEADGER_EMPTY</p>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


        </div>
    );
};

export default SalaryManagement;
