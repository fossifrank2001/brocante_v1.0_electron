import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import {IRole, IRoleList} from "../Interfaces/Role";


class RoleAPI {
    static async index(_q = ''): Promise<IRoleList> {
        try {
            const response = await axiosInstance.get<IRoleList>(`/roles?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData: Partial<IRole>): Promise<IRole> {
        try {
            const response = await axiosInstance.post<IRole>('/roles', roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, roleData: Partial<IRole>): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.put<IApiResponse>(`/roles/${id}`, roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/roles/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default RoleAPI;
