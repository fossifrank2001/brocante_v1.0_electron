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
};

export default ReportAPI;
