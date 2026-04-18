import axiosInstance from 'Data/Utilities/axiosInstance';

const InventoryAPI = {
    index: (params?: Record<string, any>) =>
        axiosInstance.get('/inventories', { params }),

    store: (data: { name: string; notes?: string; category_id?: number }) =>
        axiosInstance.post('/inventories', data),

    show: (id: number) =>
        axiosInstance.get(`/inventories/${id}`),

    start: (id: number) =>
        axiosInstance.post(`/inventories/${id}/start`),

    complete: (id: number, applyAdjustments: boolean = false) =>
        axiosInstance.post(`/inventories/${id}/complete`, { apply_adjustments: applyAdjustments }),

    cancel: (id: number) =>
        axiosInstance.post(`/inventories/${id}/cancel`),

    updateItem: (inventoryId: number, itemId: number, data: { counted_quantity: number; note?: string }) =>
        axiosInstance.put(`/inventories/${inventoryId}/items/${itemId}`, data),
};

export default InventoryAPI;
