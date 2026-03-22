import axiosInstance, { IApiResponseBase, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import Toast from "../Utilities/Toast";
import { IProductPayload } from "Data/Interfaces/Product.ts";
import { IProduct } from 'Data/Interfaces/Supply.ts';
import constants from "Data/Utilities/constants.ts";


class ProductAPI {

    static STOCK = 'stock'
    static OUT_OF_STOCK = 'out-of-stock'
    static async index(
        _q = '',
        page = 0,
        sub_categories = '',
        price_between = '',
        status = '',
        per_page: number = constants.PER_PAGE
    ): Promise<IApiResponsePaginated<IProduct>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const url = new URL(`${constants.BASE_URL}/products`);
            const filters = {
                ...price_between !== '' && { price_between },
                ...sub_categories !== '' && { sub_categories },
                ...status !== '' && { status }
            };
            url.searchParams.set("start", `${(page - 1) * per_page}`);
            url.searchParams.set("per_page", String(per_page));
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", _q);

            const response = await axiosInstance.get<IApiResponsePaginated<IProduct>>(url.href);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }



    static async show(product: number): Promise<IApiResponseBase<IProduct>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponseBase<IProduct>>(`/products/${product}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async create(payload: Partial<IProductPayload>): Promise<IApiResponseBase<IProduct>> {
        try {
            const subcategory_ids = (payload.subcategory_ids || [])
                .map(sub => (typeof sub === 'object' && sub !== null) ? sub.id : sub)
                .filter(id => id !== null && id !== undefined);

            const newPayload = { ...payload, subcategory_ids };
            const response = await axiosInstance.post<IApiResponseBase<IProduct>>('/products', newPayload);
            Toast.success(response.data.message);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, payload: Partial<IProductPayload>): Promise<IApiResponseBase<IProduct>> {
        try {
            const sanitizedPayload = { ...payload };

            if (sanitizedPayload.subcategory_ids) {
                sanitizedPayload.subcategory_ids = sanitizedPayload.subcategory_ids
                    .map(sub => (typeof sub === 'object' && sub !== null) ? sub.id : sub)
                    .filter(id => id !== null && id !== undefined) as any;
            }

            if (sanitizedPayload.suppliers) {
                sanitizedPayload.suppliers = sanitizedPayload.suppliers.map((sup: any) => ({
                    name: sup.name,
                    contact_info: sup.contact_info,
                    ...(sup.id && { id: sup.id })
                }));
            }

            const response = await axiosInstance.put<IApiResponseBase<IProduct>>(`/products/${id}`, sanitizedPayload);
            Toast.success(response.data.message);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async delete(product: number): Promise<IApiResponseBase<IProduct>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.delete(`/products/${product}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async findByReference(reference: string, type: 'internal' | 'barcode' | 'auto' = 'auto'): Promise<IApiResponseBase<IProduct>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponseBase<IProduct>>('/products/find-by-reference', {
                reference,
                type
            });
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }

    static async generateQRCode(productId: number): Promise<IApiResponseBase<{ product: IProduct; qr_code_url: string }>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponseBase<{ product: IProduct; qr_code_url: string }>>(`/products/${productId}/generate-qr`);
            Toast.success(response.data.message);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }
}

export default ProductAPI;
