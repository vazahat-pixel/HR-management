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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Performance Intake</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Excel Telemetry Bulk Processing</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
                    <HiOutlineInformationCircle className="text-emerald-500 w-5 h-5" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Columns Required: CasperEHRID, Full_Name, HubName, OFD, OFP, DEL, PICK</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                            <HiOutlineUpload className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Upload Daily Reports</h3>
                            <p className="text-xs text-slate-500 font-bold">Bulk process employee performance data</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1">Required Columns</p>
                                <p className="text-xs text-blue-700 font-medium">CasperEHRID, Full_Name, HubName, OFD, OFP, DEL, PICK</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Date</label>
                            <input
                                type="date"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Performance File (.xlsx, .csv)</label>
                            <label className={`
                            relative flex flex-col items-center justify-center 
                            border-2 border-dashed rounded-2xl p-8 cursor-pointer
                            transition-all duration-300
                            ${file
                                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50'
                                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
                                }
                        `}>
                                <input
                                    type="file"
                                    accept=".xlsx,.csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                                            <HiOutlineDocumentText className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-black text-emerald-700">{file.name}</p>
                                        <p className="text-xs text-emerald-600 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-200 flex items-center justify-center">
                                            <HiOutlineUpload className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-black text-slate-600">Click to Browse Files</p>
                                        <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !file}
                            className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <HiOutlineCloudUpload className="w-5 h-5" />
                                    Execute Bulk Upload
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Upload Report */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col h-full"
                            >
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <HiOutlineDocumentReport className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none text-uppercase">Ingestion Analysis</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Processed Successfully</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[28px] text-center">
                                        <div className="text-3xl font-black text-emerald-700">{result.results.success}</div>
                                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Success Rows</div>
                                    </div>
                                    <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-[28px] text-center">
                                        <div className="text-3xl font-black text-rose-700">{result.results.failed}</div>
                                        <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">Failed Rows</div>
                                    </div>
                                </div>

                                {result.results.details.length > 0 && (
                                    <div className="mt-8 flex-1">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-rose-500 pl-3 mb-4">Error Log Telemetry</h4>
                                        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                            {result.results.details.map((detail, idx) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-4 shadow-inner">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase">ID: {detail.ehrId || 'Unknown'}</span>
                                                    <span className="text-[9px] font-bold text-rose-600 uppercase bg-white border border-rose-100 px-2.5 py-1 rounded-full">{detail.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!result && !isLoading && (
                            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-12 text-center opacity-60">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
                                    <HiOutlineCheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Awaiting Transmission</h3>
                                <p className="text-xs text-slate-400 font-bold max-w-[200px] mt-2">The upload report will appear here once the automation executes.</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full bg-white border border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
                                <div className="loading-spinner mb-6 h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Processing Node</h3>
                                <p className="text-xs text-slate-400 font-bold mt-2">Mapping CasperEHRIDs and calculating deltas...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DailyReportUpload;
