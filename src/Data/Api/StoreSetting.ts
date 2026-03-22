import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IStoreSetting, IStoreSettingPayload } from '@/Data/Interfaces/StoreSetting';

class StoreSettingAPI {
    static async show(): Promise<IApiResponseBase<IStoreSetting>> {
        const response = await axiosInstance.get<IApiResponseBase<IStoreSetting>>('/store-settings');
        return response.data;
    }

    static async update(payload: IStoreSettingPayload): Promise<IApiResponseBase<IStoreSetting>> {
        const response = await axiosInstance.put<IApiResponseBase<IStoreSetting>>('/store-settings', payload);
        return response.data;
    }

    static async uploadLogo(file: File): Promise<IApiResponseBase<IStoreSetting>> {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await axiosInstance.post<IApiResponseBase<IStoreSetting>>('/store-settings/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    static async uploadSignature(file: File): Promise<IApiResponseBase<IStoreSetting>> {
        const formData = new FormData();
        formData.append('signature', file);
        const response = await axiosInstance.post<IApiResponseBase<IStoreSetting>>('/store-settings/signature', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
}

export default StoreSettingAPI;
