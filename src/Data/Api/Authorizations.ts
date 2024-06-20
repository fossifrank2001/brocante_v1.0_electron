import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import { IHabilitationPayload } from "Data/Interfaces/Habilitation";


class AuthorizationAPI {
    static async index(_q = ''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/authorizations?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    static async permissions(_q = ''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/permissions?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async show(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/authorizations/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData: Partial<IHabilitationPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>('/authorizations', roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, roleData: Partial<IHabilitationPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.put<IApiResponse>(`/authorizations/${id}`, roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/authorizations/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthorizationAPI;
