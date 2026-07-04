import axiosInstance, { IApiResponse, InferApiResponse } from 'Data/Utilities/axiosInstance';

export interface IPurchaseOrderItem {
    id?: number;
    purchase_order_id?: number;
    product_id?: number | null;
    product_name: string;
    quantity: number;
    unit_cost: number;
    total: number;
    product?: any;
}

export interface IPurchaseOrder {
    id?: number;
    po_code: string;
    supplier_id: number | null;
    status: 'draft' | 'pending' | 'received' | 'cancelled';
    total_amount: number;
    expected_date: string | null;
    notes: string | null;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
    supplier?: any;
    user?: any;
    items?: IPurchaseOrderItem[];
}

export interface IPurchaseOrderPayload {
    supplier_id?: number | null;
    expected_date?: string | null;
    notes?: string | null;
    items: IPurchaseOrderItem[];
}

class PurchaseOrderAPI {
    static async index(params?: Record<string, any>): Promise<InferApiResponse<any>> {
        const res = await axiosInstance.get('/purchase-orders', { params });
        return res.data;
    }

    static async show(id: number): Promise<InferApiResponse<IPurchaseOrder>> {
        const res = await axiosInstance.get(`/purchase-orders/${id}`);
        return res.data;
    }

    static async create(payload: IPurchaseOrderPayload): Promise<InferApiResponse<IPurchaseOrder>> {
        const res = await axiosInstance.post('/purchase-orders', payload);
        return res.data;
    }

    static async update(id: number, payload: IPurchaseOrderPayload): Promise<InferApiResponse<IPurchaseOrder>> {
        const res = await axiosInstance.put(`/purchase-orders/${id}`, payload);
        return res.data;
    }

    static async receive(id: number): Promise<IApiResponse> {
        const res = await axiosInstance.post(`/purchase-orders/${id}/receive`);
        return res.data;
    }

    static async cancel(id: number): Promise<IApiResponse> {
        const res = await axiosInstance.post(`/purchase-orders/${id}/cancel`);
        return res.data;
    }

    static async delete(id: number): Promise<IApiResponse> {
        const res = await axiosInstance.delete(`/purchase-orders/${id}`);
        return res.data;
    }
}

export default PurchaseOrderAPI;
