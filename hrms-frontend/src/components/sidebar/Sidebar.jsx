import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlineViewGrid,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineDocumentReport,
    HiOutlineCash,
    HiOutlineChatAlt2,
    HiOutlineGift,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineBell
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    const menuItems = [
        {
            group: 'Main Menu',
            items: role === 'admin' ? [
                { name: 'Overview', icon: HiOutlineViewGrid, path: '/admin/dashboard' },
                { name: 'Employees', icon: HiOutlineUsers, path: '/admin/employees' },
                { name: 'Attendance', icon: HiOutlineCalendar, path: '/admin/attendance' },
            ] : [
                { name: 'Overview', icon: HiOutlineViewGrid, path: '/employee/dashboard' },
                { name: 'Daily Reports', icon: HiOutlineDocumentReport, path: '/employee/performance' },
                { name: 'Attendance', icon: HiOutlineCalendar, path: '/employee/attendance' },
            ]
        },
        {
            group: 'Finance & Reports',
            items: role === 'admin' ? [
                { name: 'Salary Hub', icon: HiOutlineCash, path: '/admin/salary' },
                { name: 'Reports', icon: HiOutlineDocumentReport, path: '/admin/reports' },
            ] : [
                { name: 'Salary Reports', icon: HiOutlineCash, path: '/employee/salary' },
                { name: 'Notifications', icon: HiOutlineBell, path: '/employee/notifications' },
            ]
        },
        {
            group: 'Management',
            items: role === 'admin' ? [
                { name: 'Feedback', icon: HiOutlineChatAlt2, path: '/admin/feedback' },
                { name: 'Offers', icon: HiOutlineGift, path: '/admin/offers' },
                { name: 'Settings', icon: HiOutlineCog, path: '/admin/settings' },
            ] : [
                { name: 'Feedback', icon: HiOutlineChatAlt2, path: '/employee/feedback' },
                { name: 'Benefits', icon: HiOutlineGift, path: '/employee/offers' },
                { name: 'My Profile', icon: HiOutlineCog, path: '/employee/settings' },
            ]
        }
    ];

    return (
        <aside className="hidden lg:flex w-64 layout-sidebar flex-col h-screen sticky top-0 overflow-hidden z-40 bg-slate-950 border-r border-slate-800/30">
            <div className="p-6 border-b border-slate-800/30 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-950 text-base font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    K
                </div>
                <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-white tracking-tighter leading-none">HRMS ADMIN</span>
                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1">Management Portal</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-8 overflow-y-auto scrollbar-hide mt-4">
                {menuItems.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                        <h3 className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">{group.group}</h3>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link-tech group ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[11px] font-black tracking-wide">{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800/30">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all group"
                >
                    <HiOutlineLogout className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black tracking-wide uppercase">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
