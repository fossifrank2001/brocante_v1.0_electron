import axiosInstance, { IApiResponse } from 'Data/Utilities/axiosInstance';
import Toast from "Data/Utilities/Toast.ts";

class SupplyAPI {
    static async index(_q = ''): Promise<never> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<never>(`/suppliers?q=${_q}`);
            return response.data as any;
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
