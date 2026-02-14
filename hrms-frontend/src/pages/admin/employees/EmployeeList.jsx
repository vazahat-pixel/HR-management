import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDotsHorizontal } from 'react-icons/hi';

const EmployeeList = () => {
    const employees = [
        { id: 1, name: 'Alex Morgan', role: 'Senior Developer', department: 'Engineering', status: 'Active' },
        { id: 2, name: 'Sarah Connor', role: 'Project Manager', department: 'Product', status: 'Active' },
        { id: 3, name: 'John Doe', role: 'Designer', department: 'Design', status: 'On Leave' },
        { id: 4, name: 'Jane Smith', role: 'QA Engineer', department: 'Engineering', status: 'Active' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Employee Directory</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary-500/20">
                    <HiOutlinePlus className="w-5 h-5" />
                    Add Employee
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 group">
                    <HiOutlineSearch className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <select className="h-10 px-4 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 focus:ring-1 focus:ring-primary-500 outline-none">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Design</option>
                </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {employees.map((emp, i) => (
                            <motion.tr
                                key={emp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-slate-800/50 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">{emp.name}</p>
                                            <p className="text-xs text-slate-500">ID: #{1000 + emp.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{emp.role}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{emp.department}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors">
                                        <HiOutlineDotsHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 mt-4 px-2">
                <span>Showing 4 of 120 employees</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors">Previous</button>
                    <button className="px-3 py-1 bg-primary-600/20 text-primary-500 rounded font-medium">1</button>
                    <button className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeList;
