import axios, { AxiosError, AxiosResponse } from 'axios';
import Toast from 'Data/Utilities/Toast';
import ApiError from 'Data/Utilities/ApiError';
import constants from 'Data/Utilities/constants';
import UtilMethods from 'Data/Utilities/UtilMethods';
import store from 'Data/Objects/store';
import { redirectToLogin } from '@/Data/Slices/NavigationSlice';
import { clearUserCredential } from '@/Data/Slices/auth/userSlice';

export interface IApiResponse {
    message: string;
    data: any | null;
}

const instance = axios.create({
    baseURL: constants.BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'X-localization': 'fr',
    }
});  

instance.interceptors.request.use(
    (config) => {
        config.headers['Auth-Token'] = store.getState()?.user?.token;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


interface IApiResult {
    status: number;
    data: Object | any;
}

instance.interceptors.response.use(
    (response: AxiosResponse<IApiResponse>) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.data) {
            const result: IApiResult = error.response as any;
            const message = result.data?.message || 'An error occurred.';
            if (result.status === 401) {
                (async () => {
                    await UtilMethods.delai(2);
                    store.dispatch(clearUserCredential());
                    store.dispatch(redirectToLogin());
                })();
                // return Promise.reject(error); // Rejeter la promesse avec l'erreur actuelle
            }
            Toast.error(message, 2000, 'top-right');
            return Promise.reject(new ApiError(result.status, message, result.data));
        } else if (error.request) {
            Toast.error('No response from server.', 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'No response from server.'));
        } else {
            Toast.error('Error while configuring server.', 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'Error while configuring server.'));
        }
    }
);

export default instance;
