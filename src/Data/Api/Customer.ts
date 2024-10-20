import axiosInstance, { IApiResponse, InferApiResponse } from 'Data/Utilities/axiosInstance';
import {IPerson, IPersonList} from "Data/Interfaces/Person.ts";
import Toast from "Data/Utilities/Toast.ts";

class CustomerAPI{

    // Fetch all customers
    static async get(_q='', withoutPagination = false): Promise<IPersonList> {
        try {
            const params = {
                params: {
                    q: _q
                },
                headers: {
                    'Without-Pagination': withoutPagination
                }
            };
            const response = await axiosInstance.get<IPersonList>(`/customers`, params);
            return response.data;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    static async create(payload: IPerson): Promise<InferApiResponse<IPerson>>{
        try {
            const response = await axiosInstance.post(`/customers`, payload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse>{
        try {
            const response = await axiosInstance.delete(`/customers/${id}`);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }
}

export default CustomerAPI;
