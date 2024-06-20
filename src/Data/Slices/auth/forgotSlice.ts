import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {IForgotPayload} from "Interfaces";
import { IApiResponse } from "Data/Utilities/axiosInstance";
import { ForgotState, Pages} from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import store, { AppDispatch } from '@/Data/Objects/store';
import { setActivePage } from '../NavigationSlice';
import Toast from '@/Data/Utilities/Toast';

const defaultUserForgotState: ForgotState = {
    reset_token: "",
    message: "",
    username: "",
};


const forgotSlice = createSlice({
    name: 'forgot',
    initialState: defaultUserForgotState,
    reducers: {
        forgotPassword: (state: ForgotState, action: PayloadAction<IApiResponse>) =>{
            const { data: { reset_token, username }, message } = action.payload;
            state.reset_token = reset_token;
            state.message = message;
            state.username = username;
        },
        updateToken: (state: ForgotState, action: PayloadAction<string>) =>{
            state.reset_token = action.payload;
        }
    },
});

export const updateToken = forgotSlice.actions.updateToken

export const forgotAsync = (payload: IForgotPayload) => async (dispatch: AppDispatch) =>{
    try {
        const response: IApiResponse  = await AuthAPI.forgot(payload);
        dispatch(forgotSlice.actions.forgotPassword(response));
        Toast.success(response.message)
        store.dispatch(setActivePage({page: Pages.RESET_PAGE}))
    } catch (error) {
    }
};

export default forgotSlice.reducer;
