import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import { ICategoryPayload } from "../Interfaces/Category";
import Toast from "../Utilities/Toast";


class CategoryAPI {
    static async index(_q = ''): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/categories?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }



    static async show(category: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/categories/${category}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData: ICategoryPayload): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>('/categories', roleData);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, categoryData: ICategoryPayload): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.put<IApiResponse>(`/categories/${id}`, categoryData);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default CategoryAPI;
