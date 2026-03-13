import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { ICashSession, ICashSessionOpenPayload, ICashSessionClosePayload, ICashSessionSummary } from '@/Data/Interfaces/CashSession';

class CashSessionAPI {
    static async current(): Promise<IApiResponseBase<ICashSession | null>> {
        const response = await axiosInstance.get<IApiResponseBase<ICashSession | null>>('/cash-sessions/current', {
            timeout: 15000,
        });
        return response.data;
    }

    static async index(): Promise<IApiResponseBase<any>> {
        const response = await axiosInstance.get<IApiResponseBase<any>>('/cash-sessions');
        return response.data;
    }

    static async open(payload: ICashSessionOpenPayload): Promise<IApiResponseBase<ICashSession>> {
        const response = await axiosInstance.post<IApiResponseBase<ICashSession>>('/cash-sessions/open', payload);
        return response.data;
    }

    static async close(sessionId: number, payload: ICashSessionClosePayload): Promise<IApiResponseBase<ICashSession>> {
        const response = await axiosInstance.post<IApiResponseBase<ICashSession>>(`/cash-sessions/${sessionId}/close`, payload);
        return response.data;
    }

    static async summary(sessionId: number): Promise<IApiResponseBase<ICashSessionSummary>> {
        const response = await axiosInstance.get<IApiResponseBase<ICashSessionSummary>>(`/cash-sessions/${sessionId}/summary`);
        return response.data;
    }
}

export default CashSessionAPI;
