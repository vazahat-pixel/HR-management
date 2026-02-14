import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlinePlus,
    HiOutlineDotsHorizontal,
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineBriefcase,
    HiOutlineLocationMarker,
    HiOutlineTrash,
    HiOutlinePencil
} from 'react-icons/hi';
import Modal from '../../../components/common/Modal';

const EmployeeList = () => {
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Dummy Data for Logic
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Alice Johnson', role: 'Software Engineer', department: 'Engineering', status: 'Active', email: 'alice@company.com', joinDate: 'Jan 15, 2023', location: 'New York, USA' },
        { id: 2, name: 'Bob Smith', role: 'Product Manager', department: 'Product', status: 'On Leave', email: 'bob@company.com', joinDate: 'Mar 01, 2022', location: 'San Francisco, USA' },
        { id: 3, name: 'Charlie Brown', role: 'Designer', department: 'Design', status: 'Active', email: 'charlie@company.com', joinDate: 'Jul 20, 2023', location: 'London, UK' },
    ]);

    const handleAddEmployee = () => {
        setIsAddModalOpen(true);
    };

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setIsViewModalOpen(false); // Close view modal if open
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        // In a real app, delete from API
        setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    // Dummy form handler
    const handleSaveEmployee = (e) => {
        e.preventDefault();
        setIsAddModalOpen(false);
        // In a real app, you'd add the employee to the list here
        alert("Dummy Action: New Employee Added Successfully!");
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Employees</h1>
                    <p className="text-zinc-400 text-sm mt-1">Manage your team members and their roles.</p>
                </div>
                <button
                    onClick={handleAddEmployee}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 cursor-pointer"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Add Employee
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder-zinc-600 transition-all font-medium text-sm"
                        onClick={() => console.log("Dummy UI: Search focused")}
                    />
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all cursor-pointer"
                    onClick={() => alert("Dummy Action: Open Filter Options")}
                >
                    <HiOutlineFilter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="p-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">Name</th>
                            <th className="p-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">Role</th>
                            <th className="p-4 font-bold text-zinc-400 uppercase tracking-wider text-xs">Status</th>
                            <th className="p-4 font-bold text-zinc-400 uppercase tracking-wider text-xs text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {employees.map((emp) => (
                            <tr
                                key={emp.id}
                                className="hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                onClick={() => handleRowClick(emp)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold border border-primary-500/20">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-200 group-hover:text-white">{emp.name}</p>
                                            <p className="text-xs text-zinc-500">{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-400">
                                    <p className="text-zinc-300 font-medium">{emp.role}</p>
                                    <p className="text-xs">{emp.department}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${emp.status === 'Active'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRowClick(emp); }}
                                        className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                                    >
                                        <HiOutlineDotsHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Dummy */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-zinc-500 font-medium">Showing 1-3 of {employees.length} employees</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer" disabled>Previous</button>
                    <button className="px-3 py-1.5 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">Next</button>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Add Employee Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Employee"
            >
                <form onSubmit={handleSaveEmployee} className="space-y-5">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-2">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">First Name</label>
                                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="e.g. John" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Last Name</label>
                                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="e.g. Doe" required />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-medium text-zinc-400">Email Address</label>
                                <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="john.doe@company.com" required />
                            </div>
                        </div>

                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-2 mt-2">Job Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Department</label>
                                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none cursor-pointer">
                                    <option>Engineering</option>
                                    <option>Design</option>
                                    <option>Product</option>
                                    <option>Marketing</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Role</label>
                                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none" placeholder="e.g. Senior Developer" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg shadow-lg shadow-primary-500/20 transition-all cursor-pointer"
                        >
                            Create Employee
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Employee Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Employee Profile"
            >
                {selectedEmployee && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {selectedEmployee.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedEmployee.name}</h2>
                                <p className="text-primary-400 font-medium text-sm">{selectedEmployee.role}</p>
                                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedEmployee.status === 'Active'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                    {selectedEmployee.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-3">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <HiOutlineBriefcase className="w-4 h-4" /> Work
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Department</span>
                                        <span className="text-zinc-200 font-medium">{selectedEmployee.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Joined</span>
                                        <span className="text-zinc-200 font-medium">{selectedEmployee.joinDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-3">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <HiOutlineUser className="w-4 h-4" /> Contact
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <HiOutlineMail className="w-4 h-4" />
                                        <span className="text-zinc-200">{selectedEmployee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <HiOutlineLocationMarker className="w-4 h-4" />
                                        <span className="text-zinc-200">{selectedEmployee.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                onClick={() => alert("Dummy Action: Edit Mode (Same as Add for now)")}
                            >
                                <HiOutlinePencil className="w-4 h-4" />
                                Edit Details
                            </button>
                            <button
                                className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                onClick={() => handleDeleteClick(selectedEmployee)}
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                maxWidth="max-w-sm"
            >
                {employeeToDelete && (
                    <div className="space-y-4">
                        <p className="text-zinc-300 text-sm">
                            Are you sure you want to delete <span className="font-bold text-white">{employeeToDelete.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeList;
