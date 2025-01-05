import axiosInstance from "Data/Utilities/axiosInstance.ts";
import {DashboardResponse} from "Data/Interfaces/dashboard.ts";

export const Dashboard = {
    getAccountStats: async (): Promise<DashboardResponse> => {
        const response = await axiosInstance.get('/dashboard?indicator=account');
        return response.data;
    },

    getSalesStats: async (params?: { startDate?: string; endDate?: string }): Promise<DashboardResponse> => {
        const response = await axiosInstance.get(`/dashboard?indicator=sale&start_date=${params.startDate}&end_date=${params.endDate}`);
        return response.data;
    },

    getProductStats: async (): Promise<DashboardResponse> => {
        const response = await axiosInstance.get('/dashboard?indicator=product');
        return response.data;
    }
};
