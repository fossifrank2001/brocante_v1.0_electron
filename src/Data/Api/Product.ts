import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";
import Toast from "../Utilities/Toast";
import {IProductPayload} from "Data/Interfaces/Product.ts";
import {ISubCategory, ISupply} from "Data/Interfaces/Supply.ts";
import constants from "Data/Utilities/constants.ts";


class ProductAPI {

    static STOCK = 'stock'
    static OUT_OF_STOCK = 'out-of-stock'
    static async index(_q = '', page = 1, sub_categories='', price_between=''): Promise<IApiResponse> {
        try {
            const url = new URL(`${constants.BASE_URL}/products`);
            const filters = {
                ...price_between !=='' && {price_between},
                ...sub_categories !=='' && {sub_categories}
            };
            url.searchParams.set("start", `${(page - 1) * 3}`);
            url.searchParams.set("per_page", String(3));
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", _q);

            const response =await axiosInstance.get<IApiResponse>(url.href);
            return response.data;
        } catch (error) {
            throw error;
        }
    }



    static async show(product: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>(`/products/${product}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(paylaod: Partial<IProductPayload>): Promise<IApiResponse> {
        try {
            const newPayload = {...paylaod, subcategory_ids: paylaod.subcategory_ids.map(subCategory => subCategory.id)}
            const response = await axiosInstance.post<IApiResponse>('/products', newPayload);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, paylaods): Promise<IApiResponse> {
        try {
            for (const paylaod in paylaods) {
                if(paylaod === 'subcategory_ids'){
                    paylaods[paylaod] = paylaods[paylaod].map((subCategy : ISubCategory )=> subCategy.id)
                }
                if(paylaod === 'suppliers'){
                    paylaods[paylaod] = paylaods[paylaod].map((detail : ISupply )=> ({
                        name: detail.name,
                        contact_info: detail.contact_info,
                        ...detail.id && {id: detail.id}
                    }))
                }
            }

            const response = await axiosInstance.put<IApiResponse>(`/products/${id}`, paylaods);
            Toast.success(response.data.message)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(product: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.delete(`/products/${product}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default ProductAPI;
