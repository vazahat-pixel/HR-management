import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineUpload, HiOutlineDownload, HiOutlineCheckCircle, HiOutlineRefresh, HiOutlineEye } from 'react-icons/hi';
import { payrollAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const SalarySlips = () => {
    const [slips, setSlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [uploading, setUploading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState(null);

    useEffect(() => { loadSlips(); }, [selectedMonth, selectedYear]);

    const loadSlips = async () => {
        setLoading(true);
        try {
            const res = await payrollAPI.getSalarySlips({ month: selectedMonth, year: selectedYear });
            setSlips(res.data.slips || []);
        } catch (err) { console.error('Load slips error:', err); }
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
            const res = await payrollAPI.uploadSalarySlips(formData, { month: selectedMonth, year: selectedYear });
            setUploadSummary(res.data);
            toast.success('Salary slips generated successfully!');
            loadSlips();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDownloadPDF = async (slip) => {
        try {
            const res = await payrollAPI.downloadPayslipPDF(slip._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary_slip_${slip.fhrid}_${slip.month}_${slip.year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { toast.error('Failed to download PDF'); }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Salary Slips</h1>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full" />
                        Auto PDF Generation Module
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-white border border-[#DCDCDC] rounded-xl overflow-hidden shadow-sm">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent px-4 py-2.5 text-[11px] font-black text-slate-900 uppercase outline-none border-r border-[#DCDCDC] cursor-pointer hover:bg-[#F5F5F5]">
                            {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent px-4 py-2.5 text-[11px] font-black text-slate-900 outline-none cursor-pointer hover:bg-[#F5F5F5]">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all shadow-sm ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-[#C46A2D] text-white hover:bg-black'}`}>
                        <HiOutlineUpload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
                        {uploading ? 'Generating PDFs...' : 'Upload & Generate Slips'}
                        <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" accept=".xlsx" />
                    </label>
                </div>
            </div>

            {/* Upload Summary */}
            {uploadSummary && (
                <div className="bg-white border border-[#DCDCDC] p-6 rounded-[32px] shadow-sm border-l-8 border-l-[#3F7D58]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#E8F3ED] rounded-2xl flex items-center justify-center text-[#3F7D58]">
                                <HiOutlineCheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[14px] font-black text-slate-900 uppercase">Generation Completed</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PDF Archives Created Successfully</p>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total</p>
                                <p className="text-xl font-black text-slate-900">{uploadSummary.total_rows}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[#3F7D58] uppercase mb-1">Generated</p>
                                <p className="text-xl font-black text-[#3F7D58]">{uploadSummary.success_count}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[#B23A48] uppercase mb-1">Failed</p>
                                <p className="text-xl font-black text-[#B23A48]">{uploadSummary.failed_count}</p>
                            </div>
                        </div>
                    </div>
                    {uploadSummary.skipped_fhrids?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#DCDCDC]/40">
                            <p className="text-[10px] font-black text-[#B23A48] uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#B23A48] rounded-full" />
                                Skipped or Failed Items:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {uploadSummary.skipped_fhrids.map((id, i) => (
                                    <div key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-[#DCDCDC] px-3 py-2 rounded-xl flex items-center justify-between group hover:border-[#B23A48]/30 transition-colors">
                                        <span className="truncate">{id}</span>
                                        <div className="w-2 h-2 rounded-full bg-[#B23A48]/30 group-hover:bg-[#B23A48]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#DCDCDC] rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="bg-[#F5F5F5] border-b border-[#DCDCDC]">
                            {['Member Name', 'FHR_ID', 'Period', 'Net Payable', 'Status', 'Action'].map(h => (
                                <th key={h} className="text-left text-[9px] font-black text-slate-400 uppercase px-8 py-5">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-[#DCDCDC]/40">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-20 animate-pulse text-slate-300">Syncing Archives...</td></tr>
                            ) : slips.map(s => (
                                <tr key={s._id} className="hover:bg-[#F5F5F5]/30 group">
                                    <td className="px-8 py-5 font-black text-[13px] uppercase">{s.employeeName}</td>
                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest">{s.fhrid}</td>
                                    <td className="px-8 py-5 text-[11px] font-black uppercase">{monthNames[s.month - 1]} {s.year}</td>
                                    <td className="px-8 py-5 font-black text-[#3F7D58]">₹{s.netPayable?.toLocaleString()}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">PDF Generated</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button onClick={() => handleDownloadPDF(s)} className="p-2 text-slate-400 hover:text-[#C46A2D] transition-colors">
                                            <HiOutlineDownload className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {slips.length === 0 && !loading && (
                                <tr><td colSpan={6} className="text-center py-20 text-slate-300 font-black uppercase text-[10px]">No Archives available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalarySlips;
