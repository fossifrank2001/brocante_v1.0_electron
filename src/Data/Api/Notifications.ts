import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";


class NotificationsAPI {

    static READ = 'read'
    static UNREAD = 'unread'

    static async index(): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>('/notifications');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    
    static async count(): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.get<IApiResponse>('/notifications/count');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async maskAsRead(notification: number): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>(`/notifications/${notification}/read`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async maskAllAsRead(): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post<IApiResponse>(`/notifications/read-all `);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default NotificationsAPI;
