import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/verify-otp') ||
                error.config?.url?.includes('/auth/send-otp');

            if (!isAuthEndpoint) {
                console.warn('Unauthorized access - redirecting to login');
                localStorage.removeItem('hrms_token');
                localStorage.removeItem('hrms_user');
                if (window.location.pathname !== '/auth/login') {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ========== AUTH ==========
export const authAPI = {
    login: (id, password) => api.post('/auth/login', { fhrId: id, password }),
    sendOtp: (mobile) => api.post('/auth/send-otp', { mobile }),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    newJoining: (data) => api.post('/auth/new-joining', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    register: (data) => api.post('/auth/register', data),
    adminRegister: (data) => api.post('/auth/admin/register', data),
    approveJoining: (id) => api.post(`/auth/approve-joining/${id}`),
    rejectJoining: (id) => api.post(`/auth/reject-joining/${id}`),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me/profile', data),
};

// ========== EMPLOYEES ==========
export const employeesAPI = {
    getAll: (params) => api.get('/employees', { params }),
    getById: (id) => api.get(`/employees/${id}`),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
};

// ========== JOINING REQUESTS ==========
export const joiningAPI = {
    getAll: (params) => api.get('/joining-requests', { params }),
    approve: (id, config) => api.put(`/joining-requests/${id}/approve`, config),
    reject: (id, remarks) => api.put(`/joining-requests/${id}/reject`, { remarks }),
    sendCredentials: (data) => api.post('/joining-requests/send-credentials', data),
    exportExcel: () => api.get('/joining-requests/export/excel', { responseType: 'blob' }),
};

// ========== DAILY REPORTS ==========
export const reportsAPI = {
    submit: (data) => api.post('/daily-reports', data),
    getAll: (params) => api.get('/daily-reports', { params }),
};

// ========== ADVANCE REQUESTS ==========
export const advanceAPI = {
    submit: (data) => api.post('/advance-requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/advance-requests', { params }),
    update: (id, data) => api.put(`/advance-requests/${id}`, data),
};

// ========== COMPLAINTS ==========
export const complaintsAPI = {
    submit: (data) => api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/complaints', { params }),
    update: (id, data) => api.put(`/complaints/${id}`, data),
};

// ========== OFFERS ==========
export const offersAPI = {
    create: (data) => api.post('/offers', data),
    getAll: (params) => api.get('/offers', { params }),
    update: (id, data) => api.put(`/offers/${id}`, data),
    deactivate: (id) => api.delete(`/offers/${id}`),
};

// ========== NOTIFICATIONS ==========
export const notificationsAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    saveFcmToken: (token) => api.post('/notifications/fcm-token', { token }),
};

// ========== PAYROLL ==========
export const payrollAPI = {
    getSalaryStructure: (userId) => api.get(`/payroll/salary-structure/${userId}`),
    updateSalaryStructure: (userId, data) => api.post(`/payroll/salary-structure/${userId}`, data),
    downloadPayslipPDF: (id) => api.get(`/payroll/salary-slips/${id}/pdf`, { responseType: 'blob' }),
    getPayoutReport: (params) => api.get('/payroll/payout', { params }),
    downloadPayoutPDF: (params) => api.get('/payroll/payout/pdf', { params, responseType: 'blob' }),
    downloadPayoutExcel: (params) => api.get('/payroll/payout/excel', { params, responseType: 'blob' }),
    uploadPayout: (formData, params) => api.post('/payroll/payout-upload', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getEmployeePayouts: () => api.get('/payroll/payout/employee'),

    // New Salary Slips
    uploadSalarySlips: (formData, params) => api.post('/payroll/salary-slip-upload', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSalarySlips: (params) => api.get('/payroll/salary-slips', { params }),
    getEmployeeSalarySlips: () => api.get('/payroll/salary-slips/employee'),
};

// ========== DASHBOARD ==========
export const dashboardAPI = {
    getAdmin: () => api.get('/dashboard/admin'),
    getEmployee: () => api.get('/dashboard/employee'),
};

// Daily Reports API
export const dailyReportsAPI = {
    upload: (formData) => api.post('/daily-reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getEmployeeReports: (params) => api.get('/daily-reports/employee', { params }),
    getSummary: (params) => api.get('/daily-reports/summary', { params }),
    downloadReceipt: (id) => api.get(`/daily-reports/${id}/download`, { responseType: 'blob' }),
};

export default api;
