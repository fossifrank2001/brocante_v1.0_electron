import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IProductTemplate, IProductTemplatePayload } from 'Data/Interfaces/ProductTemplate';

class ProductTemplateAPI {
    static async index(subCategoryId?: number): Promise<IApiResponseBase<IProductTemplate[]>> {
        try {
            const params = subCategoryId ? { sub_category_id: subCategoryId } : {};
            const response = await axiosInstance.get<IApiResponseBase<IProductTemplate[]>>('/product-templates', { params });
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async show(id: number): Promise<IApiResponseBase<IProductTemplate>> {
        try {
            const response = await axiosInstance.get<IApiResponseBase<IProductTemplate>>(`/product-templates/${id}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async store(data: IProductTemplatePayload): Promise<IApiResponseBase<IProductTemplate>> {
        try {
            const response = await axiosInstance.post<IApiResponseBase<IProductTemplate>>('/product-templates', data);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: IProductTemplatePayload): Promise<IApiResponseBase<IProductTemplate>> {
        try {
            const response = await axiosInstance.put<IApiResponseBase<IProductTemplate>>(`/product-templates/${id}`, data);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async destroy(id: number): Promise<IApiResponseBase<null>> {
        try {
            const response = await axiosInstance.delete<IApiResponseBase<null>>(`/product-templates/${id}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }
}

export default ProductTemplateAPI;
