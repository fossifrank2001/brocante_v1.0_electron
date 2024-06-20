import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {IApiUserLogin, ILoginPayload} from "Interfaces";
import { Pages, UserState } from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import store, { AppDispatch } from '@/Data/Objects/store';
import Toast from '@/Data/Utilities/Toast';
import { IApiResponse } from '@/Data/Utilities/axiosInstance';
import { setActivePage } from '../NavigationSlice';
import { IAccess } from '@/Data/Interfaces/Access';

// État par défaut
const defaultUserState: UserState = {
    token: "",
    message: "",
    authUser: null
};

// Créer le slice
const userSlice = createSlice({
    name: 'user',
    initialState: defaultUserState,
    reducers: {
        loginSuccess(state: UserState, action: PayloadAction<IApiUserLogin>) {
            console.log(action.payload)
            const { data: { user, token }, message } = action.payload;
            state.message = message;
            state.token = token;
            state.authUser = user;
        },
        logoutSuccess(state: UserState, action: PayloadAction<IApiResponse>) {
            const { message } = action.payload;
            state.message = message;
            state.token = "";
            state.authUser = null;
        },
        clearUserCredential(state: UserState) {
            state.message = '';
            state.token = "";
            state.authUser = null;
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
    },
});

export const {clearUserCredential, addAccessToAuthUser, removeAccessToAuthUser} = userSlice.actions;

// Action asynchrone pour la connexion
export const loginAsync = (payload: ILoginPayload) => async (dispatch: AppDispatch) => {
    try {
        const response: IApiUserLogin  = await AuthAPI.login(payload);
        Toast.success(response.message)
        dispatch(userSlice.actions.loginSuccess(response));
    } catch (error) {
    }
};

// Action asynchrone pour la connexion
export const logoutAsync = () => async (dispatch: AppDispatch) => {
    try {
        const response: IApiResponse  = await AuthAPI.logout();
        Toast.success(response.message)
        store.dispatch(setActivePage({page: Pages.LOGIN}))
        dispatch(userSlice.actions.logoutSuccess(response));
    } catch (error) {
    }
};

export default userSlice.reducer;

