import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import Toast from "Data/Utilities/Toast";
import { IAccessesPayload } from "Data/Interfaces/Access";


class AccessAPI {
    static async index(_q: string = ''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/accesses?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async show(user: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/accesses/${user}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(datas: Partial<IAccessesPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>('/accesses', datas);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: Partial<IAccessesPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.put<IApiResponse>(`/accesses/${id}`, data);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(access: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete<IApiResponse>(`/accesses/${access}`);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default AccessAPI;
