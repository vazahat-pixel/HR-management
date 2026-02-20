import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUpload, HiOutlineDocumentReport, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineCloudUpload, HiOutlineDocumentText } from 'react-icons/hi';
import { dailyReportsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const DailyReportUpload = () => {
    const [file, setFile] = useState(null);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an Excel file');
            return;
        }

        setIsLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportDate', reportDate);

        try {
            const res = await dailyReportsAPI.upload(formData);
            setResult(res.data);
            toast.success('Report processed successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-tight">Bulk File Upload</h2>
                    <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C46A2D] rounded-full shadow-lg shadow-[#C46A2D]/20" />
                        Excel Report Upload
                    </p>
                </div>
                <div className="hidden xl:flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#DCDCDC] shadow-sm">
                    <HiOutlineInformationCircle className="text-[#C46A2D] w-5 h-5" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol: CasperFHRID, Full_Name, HubName, OFD, DEL, PICK</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Upload Form */}
                <div className="bg-white border border-[#DCDCDC]/60 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9EBE0]/20 to-transparent -mr-16 -mt-16 rounded-full" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#C46A2D] border border-[#DCDCDC]/40 shadow-inner group-hover:rotate-6 transition-transform">
                            <HiOutlineUpload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Daily Bulk Ingestion</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Upload Casper Performance Ledger</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Report Target Date</label>
                            <input
                                type="date"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                className="w-full bg-[#F5F5F5] border border-[#DCDCDC] rounded-2xl px-6 py-4 text-[13px] font-black text-slate-900 uppercase tracking-tight outline-none focus:bg-white focus:border-[#C46A2D] transition-all placeholder:text-slate-300"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Casper Ledger [.XLSX, .CSV]</label>
                            <label className={`
                                relative flex flex-col items-center justify-center 
                                border-2 border-dashed rounded-[32px] p-12 cursor-pointer
                                transition-all duration-500
                                ${file
                                    ? 'border-[#C46A2D] bg-[#F9EBE0]/20'
                                    : 'border-[#DCDCDC] bg-[#F5F5F5] hover:border-[#C46A2D] hover:bg-white'
                                }
                            `}>
                                <input
                                    type="file"
                                    accept=".xlsx,.csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="text-center animate-in zoom-in-95 duration-300">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white flex items-center justify-center text-[#C46A2D] shadow-xl border border-[#F9EBE0]">
                                            <HiOutlineDocumentText className="w-10 h-10" />
                                        </div>
                                        <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{file.name}</p>
                                        <p className="text-[10px] text-[#C46A2D] font-black uppercase tracking-widest mt-1">Payload: {(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white border border-[#DCDCDC]/40 flex items-center justify-center text-slate-300 shadow-inner">
                                            <HiOutlineCloudUpload className="w-10 h-10" />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Mount Casper File</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-6 py-1.5 bg-white rounded-full border border-[#DCDCDC]/40">Tap to Search Index</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !file}
                            className="w-full bg-slate-900 hover:bg-[#C46A2D] text-white px-8 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                                    Parsing Data Nodes...
                                </>
                            ) : (
                                <>
                                    <HiOutlineCloudUpload className="w-5 h-5" />
                                    Broadcast Reports
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Upload Report */}
                <div className="h-full">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-[#DCDCDC]/60 rounded-[40px] p-10 shadow-sm h-full flex flex-col"
                            >
                                <div className="flex items-center gap-5 border-b border-[#DCDCDC]/40 pb-8 mb-8">
                                    <div className="w-14 h-14 bg-[#F9EBE0] rounded-2xl flex items-center justify-center text-[#C46A2D] shadow-inner">
                                        <HiOutlineDocumentReport className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Transmission Analysis</h3>
                                        <p className="text-[10px] font-black text-[#3F7D58] uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-[#3F7D58] rounded-full animate-pulse" />
                                            Data Synchronized
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[#F5F5F5] border border-[#DCDCDC]/40 p-8 rounded-[32px] text-center shadow-inner">
                                        <div className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">{result.summary.success}</div>
                                        <div className="text-[9px] font-black text-[#3F7D58] uppercase tracking-[0.2em] mt-3 bg-white px-3 py-1 rounded-full border border-[#DCDCDC]/40 inline-block shadow-sm">Reports Pushed</div>
                                    </div>
                                    <div className="bg-[#F5F5F5] border border-[#DCDCDC]/40 p-8 rounded-[32px] text-center shadow-inner">
                                        <div className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">{result.summary.failed}</div>
                                        <div className="text-[9px] font-black text-[#B23A48] uppercase tracking-[0.2em] mt-3 bg-white px-3 py-1 rounded-full border border-[#DCDCDC]/40 inline-block shadow-sm">Sync Faults</div>
                                    </div>
                                </div>

                                {result.summary.skippedFhrids.length > 0 && (
                                    <div className="mt-10 flex-1 flex flex-col min-h-0">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-[3px] border-[#B23A48] pl-4 mb-5">Unmapped FHRIDs</h4>
                                        <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-3">
                                            {result.summary.skippedFhrids.map((id, idx) => (
                                                <div key={idx} className="bg-white border border-[#DCDCDC] rounded-2xl p-4 flex justify-between items-center gap-6 shadow-sm hover:border-[#B23A48]/30 transition-colors">
                                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">ID: <span className="text-[#C46A2D]">{id}</span></span>
                                                    <span className="text-[9px] font-black text-[#B23A48] uppercase bg-[#B23A48]/5 border border-[#B23A48]/10 px-3 py-1.5 rounded-xl">User Not Found</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : isLoading ? (
                            <div className="h-full min-h-[500px] bg-white border border-[#DCDCDC]/60 rounded-[40px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
                                <div className="w-16 h-16 border-[3px] border-[#F5F5F5] border-t-[#C46A2D] rounded-full animate-spin mb-8" />
                                <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.3em]">Processing Frame</h3>
                                <p className="text-[11px] text-slate-400 font-bold mt-3 leading-relaxed max-w-[240px]">Mapping employee nodes and calculating performance deltas...</p>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] bg-[#F5F5F5] border border-dashed border-[#DCDCDC] rounded-[40px] flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-slate-200 shadow-sm mb-8 border border-[#DCDCDC]/40 group-hover:scale-110 transition-transform">
                                    <HiOutlineCloudUpload className="w-12 h-12" />
                                </div>
                                <h3 className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">Awaiting Uplink</h3>
                                <p className="text-[10px] text-slate-300 font-bold max-w-[200px] mt-4 leading-relaxed uppercase tracking-wider">Operational reports will manifest here post-execution.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DailyReportUpload;
