import axios, {AxiosError, AxiosResponse, CreateAxiosDefaults} from 'axios';
import Toast from 'Data/Utilities/Toast';
import ApiError from 'Data/Utilities/ApiError';
import constants from 'Data/Utilities/constants';
import store from 'Data/Objects/store';
import {redirectToLogin, setLastPageBeforeLogin} from '@/Data/Slices/NavigationSlice';
import {Pages} from "Data/Objects/state.ts";
import {clearUserCredential} from '@/Data/Slices/auth/userSlice';

let isHandlingAuthRedirect = false;

export interface IApiResponseBase<T = unknown> {
    success?: boolean;
    message: string;
    data: T;
}

export interface IApiResponsePaginated<T = unknown> extends IApiResponseBase<{
    data: T[];
    total: number;
    per_page: number;
}> {}

export type IApiResponse<T = unknown> = | IApiResponseBase<T> | IApiResponsePaginated<T>;

export type InferApiResponse<T> = T extends Array<infer U>? IApiResponsePaginated<U> : IApiResponseBase<T>;

const instance = axios.create({
    baseURL: constants.BASE_URL,
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json',
        'X-localization': 'en',
    }
} as  CreateAxiosDefaults);

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
            const _response : IApiResult|any = error.response
            const status = _response.status;
            const message = _response.data?.message || 'An error occurred.';

            if (status === 401) { 
                if (isHandlingAuthRedirect) {
                    return Promise.reject(new ApiError(status, message, error.response.data as any));
                }
                isHandlingAuthRedirect = true;
                const stateAny: any = store.getState();
                const currentPage = stateAny?.navigation?.currentPage ?? stateAny?.navigaton?.currentPage;
                
                // Mémoriser l'état complet de la page précédente SEULEMENT si c'est une page protégée (pas LOGIN, USER_ACCESS_PAGE)
                const excludedPages = [Pages.LOGIN, Pages.USER_ACCESS_PAGE, Pages.FORGOT_PAGE, Pages.RESET_PAGE, Pages.ONBOARDING];
                if (currentPage && !excludedPages.includes(currentPage)) {
                    const navState = stateAny?.navigation ?? stateAny?.navigaton;
                    const savedState = {
                        page: currentPage,
                        id: navState?.id,
                        param: navState?.param,
                        search: navState?.search
                    };
                    store.dispatch(setLastPageBeforeLogin(savedState));
                    localStorage.setItem('savedStateBeforeLogin', JSON.stringify(savedState));
                    // Keep old storage for compatibility if needed
                    localStorage.setItem('lastVisitedPage', currentPage);
                }
                
                store.dispatch(clearUserCredential());
                
                store.dispatch(redirectToLogin());
                Toast.error("Session expired. Please log in again.", 3000, 'top-right');

                setTimeout(() => { isHandlingAuthRedirect = false; }, 1000);
            } else {
                Toast.error(message, 2000, 'top-right');
            }
            return Promise.reject(new ApiError(status, message, error.response.data as any));
        }
        else if (error.request) {
            Toast.error("No response from server.", 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'No response from server.'));
        }

        else {
            Toast.error("Erreur lors de la configuration de la requête.", 2000, 'top-right');
            return Promise.reject(new ApiError(500, 'Error while configuring request.'));
        }
    }
);


export default instance;
