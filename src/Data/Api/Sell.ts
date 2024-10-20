import axiosInstance, { InferApiResponse } from 'Data/Utilities/axiosInstance';
import Toast from "Data/Utilities/Toast.ts";
import {ISell, ISellPayload} from "Data/Interfaces/Sell.ts";

class SellAPI {
    static PAID = 'paid'
    static PARTIALLY_PAID = 'partially_paid'
    static PENDING = 'pending'
    static CANCELLED = 'canceled'
    static async create(payload: Partial<ISellPayload>): Promise<{
        status?: boolean;
        data: ISell;
        message: string;
    }> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<{
                status?: boolean;
                data: ISell;
                message: string;
            }>('/sells', payload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async cancel(sellId: number, data: { reason: string }) {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<{
                status?: boolean;
                message: string;
            }>(`/sells/cancel/${sellId}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async show(sellId: number): Promise<InferApiResponse<ISell>>
    {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<InferApiResponse<ISell>>(`/sells/${sellId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default SellAPI;
