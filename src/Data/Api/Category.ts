import axiosInstance, { IApiResponse, IApiResponseBase, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { ICategory, ICategoryPayload } from '../Interfaces/Category';
import Toast from "../Utilities/Toast";


class CategoryAPI {
    static async index(_q = ''): Promise<IApiResponsePaginated<ICategory>> {
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<ICategory>>(`/categories?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }



    static async show(category: number): Promise<IApiResponseBase<ICategory>> {
        try {
            const response = await axiosInstance.get<IApiResponseBase<ICategory>>(`/categories/${category}`);
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
