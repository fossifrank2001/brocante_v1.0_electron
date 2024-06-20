import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import { IUsersPayload } from "../Interfaces/Users";
import Toast from "../Utilities/Toast";


class UserAPI {
    static async index(_q=''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/users?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async show(user: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/users/${user}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(datas: Partial<IUsersPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>('/users', datas);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: Partial<IUsersPayload>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.put<IApiResponse>(`/users/${id}`, data);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    static async delete(user: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete<IApiResponse>(`/users/${user}`);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    static async disable(user: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/users/${user}/disable`);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    static async reactivate(user: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/users/${user}/reactivate`);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default UserAPI;
