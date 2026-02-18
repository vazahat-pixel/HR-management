import React from 'react';

const PayslipTemplate = React.forwardRef(({ data, user }, ref) => {
    // We always render the container so the ref is stable for html2canvas
    return (
        <div
            ref={ref}
            className="p-12 bg-white text-slate-800 font-sans"
            style={{ width: '794px', minHeight: '1123px', visibility: data ? 'visible' : 'hidden' }}
        >
            {!data ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">Preparing payslip data...</p>
                </div>
            ) : (() => {
                const baseAmount = parseFloat(data.amount.replace(/[^0-9.-]+/g, ""));
                const bonuses = data.type === 'Bonus' ? 270 : 0;
                const deductions = 150;
                const netSalary = baseAmount + bonuses - deductions;

                return (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-8 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-emerald-600 tracking-tighter">LAXMART HRMS</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Enterprise HR Solutions</p>
                                <div className="mt-4 text-xs font-medium text-slate-500 space-y-1">
                                    <p>123 Corporate Blvd, Silicon Valley</p>
                                    <p>California, USA 94025</p>
                                    <p>payroll@hrmspro.com</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Statement of Earnings</h2>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Period: {data.month}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Payslip ID: #PS-{user?.employeeId || 'EMP102'}-{data.month.replace(' ', '')}</p>
                            </div>
                        </div>

                        {/* Employee Info */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Employee Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Name:</span>
                                        <span className="text-xs font-black text-slate-800">{user?.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Employee ID:</span>
                                        <span className="text-xs font-black text-slate-800">{user?.employeeId || 'EMP102'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Designation:</span>
                                        <span className="text-xs font-black text-slate-800">Senior Product Designer</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Department:</span>
                                        <span className="text-xs font-black text-slate-800">Product & Engineering</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Payment Date:</span>
                                        <span className="text-xs font-black text-slate-800">{data.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Status:</span>
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">PAID (DIRECT DEPOSIT)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Currency:</span>
                                        <span className="text-xs font-black text-slate-800">USD ($)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Earnings Table */}
                        <div className="mb-12">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-emerald-600 text-white">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-tl-2xl">Income Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right rounded-tr-2xl">Net Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-2xl overflow-hidden">
                                    <tr>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tight">Basic Pay</td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-800 text-right">${baseAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tight">Housing Allowance</td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-800 text-right">$0.00</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tight">Performance Bonus</td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-800 text-right">${bonuses.toLocaleString()}</td>
                                    </tr>
                                    <tr className="bg-rose-50/50">
                                        <td className="px-6 py-4 text-xs font-bold text-rose-500 uppercase tracking-tight">Provident Fund (Tax)</td>
                                        <td className="px-6 py-4 text-xs font-black text-rose-600 text-right"> - ${deductions.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="flex justify-end pr-6">
                            <div className="w-72 bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Net Pay Amount</p>
                                <h4 className="text-3xl font-black tracking-tighter">${netSalary.toLocaleString()}</h4>
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
                                        This is a computer generated document and does not require a physical signature.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-24 text-center">
                            <div className="inline-block p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Generated Confidential Document</p>
                            </div>
                            <p className="text-[9px] font-medium text-slate-400 mt-6 tracking-wide uppercase">
                                Generated on {new Date().toLocaleDateString()} via LAXMART HRMS Secure Portal
                            </p>
                        </div>
                    </>
                );
            })()}
        </div>
    );
});

export default PayslipTemplate;
