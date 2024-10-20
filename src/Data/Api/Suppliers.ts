import axiosInstance, { IApiResponse, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import Toast from "Data/Utilities/Toast.ts";
import { ISupply } from 'Interfaces';

class SupplyAPI {
    static async index(_q = ''): Promise<IApiResponsePaginated<ISupply>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<ISupply>>(`/suppliers?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse>{
        try {
            const response = await axiosInstance.delete(`/suppliers/${id}`);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw error;
        }
    }


}

export default SupplyAPI;
