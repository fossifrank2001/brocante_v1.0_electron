import axiosInstance from "Data/Utilities/axiosInstance.ts";
import {DashboardResponse} from "Data/Interfaces/dashboard.ts";

export const Dashboard = {
    getAccountStats: async (): Promise<DashboardResponse> => {
        const response = await axiosInstance.get('/dashboard?indicator=account');
        return response.data;
    },

    getSalesStats: async (params?: { startDate?: string; endDate?: string; sellerId?: number | string }): Promise<DashboardResponse> => {
        const searchParams = new URLSearchParams();
        searchParams.set('indicator', 'sale');

        if (params?.startDate) {
            searchParams.set('start_date', params.startDate);
        }
        if (params?.endDate) {
            searchParams.set('end_date', params.endDate);
        }
        if (params?.sellerId !== undefined && params?.sellerId !== null && String(params.sellerId) !== '') {
            searchParams.set('seller_id', String(params.sellerId));
        }

        const response = await axiosInstance.get(`/dashboard?${searchParams.toString()}`);
        return response.data;
    },

    getProductStats: async (): Promise<DashboardResponse> => {
        const response = await axiosInstance.get('/dashboard?indicator=product');
        return response.data;
    },

    getCharts: async (params?: { startDate?: string; endDate?: string; sellerId?: number | string }): Promise<DashboardResponse> => {
        const searchParams = new URLSearchParams();
        searchParams.set('indicator', 'charts');

        if (params?.startDate) {
            searchParams.set('start_date', params.startDate);
        }
        if (params?.endDate) {
            searchParams.set('end_date', params.endDate);
        }
        if (params?.sellerId !== undefined && params?.sellerId !== null && String(params.sellerId) !== '') {
            searchParams.set('seller_id', String(params.sellerId));
        }

        const response = await axiosInstance.get(`/dashboard?${searchParams.toString()}`);
        return response.data;
    },
};
