import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {IApiUserLogin, ILoginPayload} from "Interfaces";
import { Pages, UserState } from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import { AppDispatch } from '@/Data/Objects/store';
import Toast from '@/Data/Utilities/Toast';
import { IApiResponse } from '@/Data/Utilities/axiosInstance';
import { setActivePage } from '../NavigationSlice';
import { IAccess } from '@/Data/Interfaces/Access';

const defaultUserState: UserState = {
    token: "",
    message: "",
    authUser: null
};

const userSlice = createSlice({
    name: 'user',
    initialState: defaultUserState,
    reducers: {
        loginSuccess(state: UserState, action: PayloadAction<IApiUserLogin>) {
            const { data: { user, token }, message } = action.payload;
            state.message = message;
            state.token = token;
            state.authUser = user;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token)
        },
        logoutSuccess(state: UserState, action: PayloadAction<IApiResponse>) {
            const { message } = action.payload;
            state.message = message;
            state.token = "";
            state.authUser = null;
            
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('lastVisitedPage');
        },
        clearUserCredential(state: UserState) {
            state.message = '';
            state.token = "";
            state.authUser = null;
            
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('lastVisitedPage');
        },
        addAccessToAuthUser(state: UserState, action: PayloadAction<IAccess>){
            
            const newAccess = action.payload;

            const retrievedAcces = state.authUser.accesses.find(access => access.id === newAccess.id)
            if (retrievedAcces) {
                return null
            }
            state.authUser.accesses = [
                ...state.authUser.accesses,
                action.payload
            ];
        },
        removeAccessToAuthUser(state: UserState, action: PayloadAction<number>){
            state.authUser.accesses = state.authUser.accesses.filter(access => access.id !== action.payload);

            return state
        },
        setFirstConnexionToFalse(state: UserState) {
            state.authUser = {
                ...state.authUser,
                first_connexion: false
            };

            return state
        },
    },
});

export const {
    clearUserCredential,
    addAccessToAuthUser,
    removeAccessToAuthUser,
    setFirstConnexionToFalse
} = userSlice.actions;

export const loginAsync = (payload: ILoginPayload) => async (dispatch: AppDispatch) => {
    try {
        const response: IApiUserLogin  = await AuthAPI.login(payload);
        Toast.success(response.message)
        dispatch(userSlice.actions.loginSuccess(response));
    } catch (error) {
        console.error(error)
    }
};

export const logoutAsync = () => async (dispatch: AppDispatch) => {
    try {
        const response: IApiResponse = await AuthAPI.logout();
        dispatch(userSlice.actions.logoutSuccess(response));
        dispatch(setActivePage({page: Pages.LOGIN}));
        Toast.success(response.message);
    } catch (error) {
        console.error(error);
        dispatch(setActivePage({page: Pages.LOGIN}));
    }
};

export default userSlice.reducer;
