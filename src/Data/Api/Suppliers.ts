import axiosInstance, { IApiResponse, InferApiResponse } from 'Data/Utilities/axiosInstance';
import Toast from "Data/Utilities/Toast.ts";
import { ISupply } from 'Interfaces';

class SupplyAPI {
    static async index(_q = '', withoutPagination = false): Promise<IApiResponse<ISupply[]>> {
        try {
            const response = await axiosInstance.get(`/suppliers?q=${_q}`, {
                headers: {
                    'Without-Pagination': withoutPagination
                }
            });
            return response.data as any;
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            throw error;
        }
    }

    static async create(payload: Partial<ISupply>): Promise<InferApiResponse<ISupply>> {
        try {
            const response = await axiosInstance.post(`/suppliers`, payload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error creating supplier:", error);
            throw error;
        }
    }

    static async update(id: number, payload: Partial<ISupply>): Promise<InferApiResponse<ISupply>> {
        try {
            const response = await axiosInstance.post(`/suppliers/${id}`, { ...payload, _method: 'PUT' });
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error updating supplier:", error);
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/suppliers/${id}`);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error deleting supplier:", error);
            throw error;
        }
    }
}

export default SupplyAPI;
