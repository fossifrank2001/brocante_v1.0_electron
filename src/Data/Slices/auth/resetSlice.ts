import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IApiResponse } from "Data/Utilities/axiosInstance";
import { Pages, ResetState} from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import store, { AppDispatch } from '@/Data/Objects/store';
import { setActivePage } from '../NavigationSlice';
import Toast from '@/Data/Utilities/Toast';
import {IResetPayload } from 'Interfaces'

const initialState: ResetState = {
    message: "",
};


const resetSlice = createSlice({
    name: 'reset',
    initialState,
    reducers: {
        resetPassword: (state: ResetState, action: PayloadAction<IApiResponse>) =>{
            const { message } = action.payload;
            state.message = message;
        }
    },
});

export const resetAsync = (payload: IResetPayload) => async (dispatch: AppDispatch) =>{
    try {
        const response: IApiResponse  = await AuthAPI.reset(payload);
        dispatch(resetSlice.actions.resetPassword(response));
        Toast.success(response.message)
        store.dispatch(setActivePage({page: Pages.LOGIN}))
    } catch (error) {
        console.error(error)
    }
};

export default resetSlice.reducer;
