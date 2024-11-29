import axios, { AxiosError, AxiosResponse } from 'axios';
import Toast from 'Data/Utilities/Toast';
import ApiError from 'Data/Utilities/ApiError';
import constants from 'Data/Utilities/constants';
import store from 'Data/Objects/store';
import {redirectToLogin} from '@/Data/Slices/NavigationSlice';
import {Pages} from "Data/Objects/state.ts";

export interface IApiResponseBase<T = unknown> {
    message: string;
    data: T;
}

export interface IApiResponsePaginated<T = unknown> extends IApiResponseBase<{
    data: T[];
    total: number;
    per_page: number;
}> {}

export type IApiResponse<T = unknown> =
  | IApiResponseBase<T>
  | IApiResponsePaginated<T>;

export type InferApiResponse<T> = T extends Array<infer U>
  ? IApiResponsePaginated<U>
  : IApiResponseBase<T>;

const instance = axios.create({
    baseURL: constants.BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'X-localization': 'en',
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
    data: {message ?: string} | never;
}

instance.interceptors.response.use(
    (response: AxiosResponse<IApiResponse>) => { 
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const _response : IApiResult = error.response
            const status = _response.status;
            const message = _response.data?.message || 'An error occurred.';

            if (status === 401) { 
                const currentPage = store.getState()?.navigaton?.currentPage;
                if (currentPage && currentPage !== Pages.LOGIN) {
                    localStorage.setItem('lastVisitedPage', currentPage);
                }
                store.dispatch(redirectToLogin());
                Toast.error('Session expirée. Redirection vers la page de connexion.', 2000, 'top-right');
            } else {
                Toast.error(message, 2000, 'top-right');
            }
            return Promise.reject(new ApiError(status, message, error.response.data));
        }
        else if (error.request) {
            Toast.error('Aucune réponse du serveur.', 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'No response from server.'));
        }

        else {
            Toast.error('Erreur lors de la configuration de la requête.', 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'Error while configuring request.'));
        }
    }
);


export default instance;
