import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IStockMovement, IStockMovementPayload, IStockMovementSummary } from '@/Data/Interfaces/StockMovement';

class StockMovementAPI {
    static async index(params?: Record<string, any>): Promise<IApiResponseBase<any>> {
        const response = await axiosInstance.get<IApiResponseBase<any>>('/stock-movements', { params });
        return response.data;
    }

    static async show(id: number): Promise<IApiResponseBase<IStockMovement>> {
        const response = await axiosInstance.get<IApiResponseBase<IStockMovement>>(`/stock-movements/${id}`);
        return response.data;
    }

    static async store(payload: IStockMovementPayload): Promise<IApiResponseBase<IStockMovement>> {
        const response = await axiosInstance.post<IApiResponseBase<IStockMovement>>('/stock-movements', payload);
        return response.data;
    }

    static async productSummary(productId: number): Promise<IApiResponseBase<IStockMovementSummary>> {
        const response = await axiosInstance.get<IApiResponseBase<IStockMovementSummary>>(`/stock-movements/product/${productId}/summary`);
        return response.data;
    }
}

export default StockMovementAPI;
