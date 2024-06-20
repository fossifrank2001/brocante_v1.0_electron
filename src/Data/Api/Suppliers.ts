import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";


class SupplyAPI {
    static async index(_q = ''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/suppliers?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }




}

export default SupplyAPI;
