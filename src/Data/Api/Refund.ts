import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IRefund, IRefundCreatePayload, IRefundBySellResponse } from '@/Data/Interfaces/Refund';

class RefundAPI {
    static async index(params?: { cash_session_id?: number; sell_id?: number }): Promise<IApiResponseBase<any>> {
        const response = await axiosInstance.get<IApiResponseBase<any>>('/refunds', { params });
        return response.data;
    }

    static async create(payload: IRefundCreatePayload): Promise<IApiResponseBase<IRefund>> {
        const response = await axiosInstance.post<IApiResponseBase<IRefund>>('/refunds', payload);
        return response.data;
    }

    static async show(id: number): Promise<IApiResponseBase<IRefund>> {
        const response = await axiosInstance.get<IApiResponseBase<IRefund>>(`/refunds/${id}`);
        return response.data;
    }

    static async bySell(sellId: number): Promise<IApiResponseBase<IRefundBySellResponse>> {
        const response = await axiosInstance.get<IApiResponseBase<IRefundBySellResponse>>(`/refunds/sell/${sellId}`);
        return response.data;
    }
}

export default RefundAPI;
