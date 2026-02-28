import axiosInstance from 'Data/Utilities/axiosInstance';
import { ActivityLog, ActivityLogFilters, ActivityLogSummary } from 'Data/Interfaces/ActivityLog';

class ActivityLogAPI {
    static async create(payload: Omit<ActivityLog, 'id' | 'timestamp' | 'userId'>): Promise<{ data: ActivityLog; message: string }> {
        console.log('[ActivityLogAPI] Creating log:', payload);
        try {
            const response = await axiosInstance.post('/activity-logs', payload);
            console.log('[ActivityLogAPI] Log created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[ActivityLogAPI] Failed to create log:', error);
            throw error;
        }
    }

    static async list(filters?: ActivityLogFilters): Promise<{ data: { data: ActivityLog[]; total: number } }> {
        const params: Record<string, any> = {};
        if (filters?.type)        params.type         = filters.type;
        if (filters?.action)      params.action        = filters.action;
        if (filters?.status)      params.status        = filters.status;
        if (filters?.sellCode)    params.sell_code     = filters.sellCode;
        if (filters?.customerId)  params.customer_id   = filters.customerId;
        if (filters?.userId)      params.user_id       = filters.userId;
        if (filters?.startDate)   params.start_date    = filters.startDate;
        if (filters?.endDate)     params.end_date      = filters.endDate;
        if (filters?.search)      params.search        = filters.search;

        const response = await axiosInstance.get('/activity-logs', { params });
        return response.data;
    }

    static async summary(filters?: Pick<ActivityLogFilters, 'startDate' | 'endDate' | 'type'>): Promise<{ data: ActivityLogSummary }> {
        const params: Record<string, any> = {};
        if (filters?.startDate) params.start_date = filters.startDate;
        if (filters?.endDate)   params.end_date   = filters.endDate;
        if (filters?.type)      params.type        = filters.type;

        const response = await axiosInstance.get('/activity-logs/summary', { params });
        return response.data;
    }

    static async entityTransitions(entityType: 'sale' | 'customer', entityId: string): Promise<{ data: any }> {
        const response = await axiosInstance.get('/activity-logs/transitions', {
            params: { entity_type: entityType, entity_id: entityId }
        });
        return response.data;
    }

    static async show(id: number): Promise<{ data: ActivityLog }> {
        const response = await axiosInstance.get(`/activity-logs/${id}`);
        return response.data;
    }
}

export default ActivityLogAPI;
