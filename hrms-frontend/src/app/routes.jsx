import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import AdminJoiningRequests from '../pages/admin/employees/JoiningRequests';
import AdminEmployeeList from '../pages/admin/employees/EmployeeList';
import AdminSalary from '../pages/admin/salary/SalaryManagement';
import AdminSalarySlips from '../pages/admin/salary/SalarySlips';
import AdminReports from '../pages/admin/reports/Reports';
import DailyReportUpload from '../pages/admin/reports/DailyReportUpload';
import AdminFeedback from '../pages/admin/feedback/Feedback';
import AdminSettings from '../pages/admin/settings/Settings';
import AdminOffers from '../pages/admin/offers/Offers';
import AdminAdvances from '../pages/admin/salary/AdvanceManagement';

import EmployeeDashboard from '../pages/employee/dashboard/Dashboard';
import EmployeeSalary from '../pages/employee/salary/SalarySlip';
import MyPerformance from '../pages/employee/reports/MyPerformance';
import EmployeeFeedback from '../pages/employee/feedback/Feedback';
import EmployeeAdvances from '../pages/employee/salary/AdvanceRequest';
import EmployeeOffers from '../pages/employee/offers/Offers';
import EmployeeNotifications from '../pages/employee/notifications/Notifications';
import EmployeeProfile from '../pages/employee/profile/Profile';
import EmployeeSettings from '../pages/employee/settings/Settings';

import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';

import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';

import {
    HiOutlineViewGrid,
    HiOutlineLockClosed,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineDocumentReport,
    HiOutlineChatAlt2,
    HiOutlineGift,
    HiOutlineCog,
    HiOutlineDatabase,
    HiOutlineUserCircle
} from 'react-icons/hi';

// Mock component placeholders for now
const Placeholder = ({ title, icon: Icon = HiOutlineViewGrid }) => (
    <div className="p-8">
        <div className="bg-white rounded-2xl p-10 shadow-soft border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl animate-pulse mb-6 flex items-center justify-center text-slate-200">
                <Icon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
            <p className="mt-4 text-slate-400 text-center max-w-sm italic">
                "Productivity is never an accident. It is always the result of a commitment to excellence."
            </p>
            <div className="mt-8 flex gap-2">
                <div className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full uppercase tracking-wider">Module Active</div>
                <div className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">Dev Mode</div>
            </div>
        </div>
    </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/auth/login" replace />;

    // Force Profile Completion
    if (user.role === 'employee' && user.isProfileCompleted === false) {
        if (location.pathname !== '/employee/profile') {
            return <Navigate to="/employee/profile" replace />;
        }
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <>
            <Routes>
                {/* Redirect Root */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<Placeholder title="Reset Password" icon={HiOutlineLockClosed} />} />
                </Route>

                {/* HR Admin Portal */}
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="joining-requests" element={<AdminJoiningRequests />} />
                    <Route path="employees" element={<AdminEmployeeList />} />
                    <Route path="salary" element={<AdminSalary />} />
                    <Route path="salary-slips" element={<AdminSalarySlips />} />
                    <Route path="advances" element={<AdminAdvances />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="reports/upload" element={<DailyReportUpload />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="offers" element={<AdminOffers />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Employee Routes */}
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute allowedRoles={['employee']}>
                            <EmployeeLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="salary" element={<EmployeeSalary />} />
                    <Route path="notifications" element={<EmployeeNotifications />} />
                    <Route path="advance" element={<EmployeeAdvances />} />
                    <Route path="performance" element={<MyPerformance />} />
                    <Route path="feedback" element={<EmployeeFeedback />} />
                    <Route path="offers" element={<EmployeeOffers />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                    <Route path="settings" element={<EmployeeSettings />} />
                </Route>
                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
        </>
    );
};

export default AppRoutes;
