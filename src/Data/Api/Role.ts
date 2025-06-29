import axiosInstance, { IApiResponse, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import {IRole} from "Interfaces";


class RoleAPI {
    static async index(_q = ''): Promise<IApiResponsePaginated<IRole>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<IRole>>(`/roles?q=${_q}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData: Partial<IRole>): Promise<IRole> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IRole>('/roles', roleData);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, roleData: Partial<IRole>): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.put<IApiResponse>(`/roles/${id}`, roleData);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.delete(`/roles/${id}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }
}

export default RoleAPI;
