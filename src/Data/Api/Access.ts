import axiosInstance, { IApiResponse, IApiResponseBase, InferApiResponse } from 'Data/Utilities/axiosInstance';
import Toast from "Data/Utilities/Toast";
import { IAccessesPayload } from "Data/Interfaces/Access";
import { IAccess } from 'Interfaces';


class AccessAPI {
    static ACTIVE = 'active';
    static INACTIVE = 'inactive';
    
    static async index(_q: string = ''): Promise<InferApiResponse<IAccess>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<InferApiResponse<IAccess>>(`/accesses?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }


    static async show(user: number): Promise<InferApiResponse<IAccess>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<InferApiResponse<IAccess>>(`/accesses/${user}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(datas: Partial<IAccessesPayload>): Promise<IApiResponseBase<IAccess>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponseBase<IAccess>>('/accesses', datas);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: Partial<IAccessesPayload>): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.put<IApiResponse>(`/accesses/${id}`, data);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(access: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.delete<IApiResponse>(`/accesses/${access}`);
            
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default AccessAPI;
