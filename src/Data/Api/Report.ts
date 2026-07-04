import axiosInstance from 'Data/Utilities/axiosInstance';

const ReportAPI = {
    salesSummary: (params?: Record<string, any>) =>
        axiosInstance.get('/reports/sales-summary', { params }),

    topProducts: (params?: Record<string, any>) =>
        axiosInstance.get('/reports/top-products', { params }),

    profitReport: (params?: Record<string, any>) =>
        axiosInstance.get('/reports/profit', { params }),

    lowStock: () =>
        axiosInstance.get('/reports/low-stock'),

    expiryReport: (params?: Record<string, any>) =>
        axiosInstance.get('/reports/expiry', { params }),

    exportCsv: (type: string, params?: Record<string, any>) =>
        axiosInstance.get('/reports/export', {
            params: { type, ...params },
            responseType: 'blob',
        }),
};

export default ReportAPI;
