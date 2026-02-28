import axiosInstance, { IApiResponse, InferApiResponse } from 'Data/Utilities/axiosInstance';
import { IPerson } from "Data/Interfaces/Person.ts";
import Toast from "Data/Utilities/Toast.ts";
import { AxiosRequestConfig } from "axios";

class CustomerAPI {

    // Fetch all customers
    static async get(_q = '', withoutPagination = false): Promise<never> {
        try {
            const params = {
                params: {
                    q: _q
                },
                headers: {
                    'Without-Pagination': withoutPagination
                }
            };
            const response = await axiosInstance.get<never>(`/customers?q=${_q}`, params as AxiosRequestConfig);
            return response.data as never;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    static async create(payload: IPerson): Promise<InferApiResponse<IPerson>> {
        try {
            const response = await axiosInstance.post(`/customers`, payload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    }

    static async update(id: number, payload: IPerson): Promise<InferApiResponse<IPerson>> {
        try {
            const response = await axiosInstance.put(`/customers/${id}`, payload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/customers/${id}`);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    /**
     * Recouvrir les dettes d'un client avec son company_balance
     * Les dettes sont traitées du plus petit au plus grand pour maximiser le nombre de dettes payées
     */
    static async recoverDebts(personId: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post(`/customers/${personId}/recover-debts`);
            Toast.success(response.data.message, 3000, 'top-right');
            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erreur lors du recouvrement des dettes";
            Toast.error(errorMsg, 3000, 'top-right');
            throw error;
        }
    }
}

export default CustomerAPI;
