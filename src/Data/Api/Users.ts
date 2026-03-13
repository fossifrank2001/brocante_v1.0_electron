import axiosInstance, { IApiResponse, IApiResponsePaginated, InferApiResponse } from 'Data/Utilities/axiosInstance';
import { IUsersPayload } from "../Interfaces/Users";
import Toast from "../Utilities/Toast";
import { IUser } from 'Interfaces';


class UserAPI {
    static async index(_q=''): Promise<IApiResponsePaginated<IUser>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<IUser>>(`/users?q=${_q}`);
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }

    static async show(user: number): Promise<InferApiResponse<IUser>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<InferApiResponse<IUser>>(`/users/${user}`);
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }

    static async create(datas: Partial<IUsersPayload>): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponse>('/users', datas);
            Toast.success(response.data.message)
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: Partial<IUsersPayload>): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.put<IApiResponse>(`/users/${id}`, data);
            Toast.success(response.data.message)
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }
    
    static async delete(user: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.delete<IApiResponse>(`/users/${user}`);
            
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }
    
    static async disable(user: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponse>(`/users/${user}/disable`);
            
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }
    
    static async reactivate(user: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
         try {
            const response = await axiosInstance.get<IApiResponse>(`/users/${user}/reactivate`);
            
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }

    static async sellers(_q = ''): Promise<IApiResponsePaginated<IUser>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<IUser>>(`/sellers?q=${_q}`);
            return response.data as never;
        } catch (error) {
            throw error;
        }
    }
}

export default UserAPI;
