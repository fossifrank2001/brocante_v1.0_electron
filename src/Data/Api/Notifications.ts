import axiosInstance, { IApiResponse, IApiResponseBase, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { INotification } from 'Interfaces';


class NotificationsAPI {

    static READ = 'read'
    static UNREAD = 'unread'

    static async index(): Promise<any> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<any>('/notifications');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    
    static async count(): Promise<IApiResponseBase<never>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponseBase<never>>('/notifications/count');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async maskAsRead(notification: number): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponse>(`/notifications/${notification}/read`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async maskAllAsRead(): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponse>(`/notifications/read-all `);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default NotificationsAPI;
