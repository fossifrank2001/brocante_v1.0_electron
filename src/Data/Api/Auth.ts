import axiosInstance, { IApiResponse, IApiResponseBase } from 'Data/Utilities/axiosInstance';
import {
    IAccessPayload,
    IApiUserLogin,
    IForgotPayload,
    IHabilitation,
    ILoginPayload,
    IResendTokenPayload,
    IResetPayload
} from 'Interfaces';

class AuthAPI {
    static async login(payload: ILoginPayload): Promise<IApiUserLogin> {
        try {
            const response = await axiosInstance.post('/auth/login', payload);
            return response.data;
        } catch (error) {
            console.error("Error occurred during login:", error);
            throw error;
        }
    }

    static async forgot(payload: IForgotPayload): Promise<IApiResponseBase<{
        reset_token: string;
        username: string;
        message: string;
        data: {
            reset_token: string
            username: string;
        };
    }>> {
        try {
            const response = await axiosInstance.post(`/auth/forgot`, payload);
            return response.data;
        } catch (error) {
            console.error("Error occurred during forgot password:", error);
            throw error;
        }
    }

    static async resendToken(payload: IResendTokenPayload): Promise<IApiResponseBase<{
        reset_token: string;
        message: string;
        data: {
            reset_token: string
        };
    }>> {
        try {
            const response = await axiosInstance.post(`/auth/resend-token`, payload);
            return response.data;
        } catch (error) {
            console.error("Error occurred during token resend:", error);
            throw error;
        }
    }

    static async reset(payload: IResetPayload): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post('/auth/reset', payload);
            return response.data;
        } catch (error) {
            console.error("Error occurred during password reset:", error);
            throw error;
        }
    }

    static async access(payload: IAccessPayload): Promise<IApiResponseBase<{
        authorizations: IHabilitation[]|null;
        auth_access_id: string;
        message: string;
        data: {
            authorizations: IHabilitation[]|null
            auth_access_id: string;
        };
    }>> {
        try {
            const response = await axiosInstance.post(`/auth/user-access`, payload);
            return response.data;
        } catch (error) {
            console.error("Error occurred during access request:", error);
            throw error;
        }
    }

    static async logout(): Promise<IApiResponse> {
        try {
            const response = await axiosInstance.post(`/auth/logout`);
            return response.data;
        } catch (error) {
            console.error("Error occurred during logout:", error);
            throw error;
        }
    }
}

export default AuthAPI;
