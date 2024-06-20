import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IApiResponse } from "Data/Utilities/axiosInstance";
import { Pages, ResendTokenState} from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import store, { AppDispatch } from '@/Data/Objects/store';
import Toast from '@/Data/Utilities/Toast';
import {IResendTokenPayload } from 'Interfaces'
import { updateToken } from 'Data/Slices/auth/forgotSlice';

const initialState: ResendTokenState = {
    message: "",
    reset_token: ""
};


const resendTokenSlice = createSlice({
    name: 'resendToken',
    initialState,
    reducers: {
        resendToken: (state: ResendTokenState, action: PayloadAction<IApiResponse>) =>{
            const { data:{reset_token}, message } = action.payload;
            state.message = message;
            state.reset_token = reset_token;
        }
    },
});

export const resendTokenAsync = (payload: IResendTokenPayload) => async (dispatch: AppDispatch) =>{
    try {
        const response: IApiResponse  = await AuthAPI.resendToken(payload)
        dispatch(resendTokenSlice.actions.resendToken(response));
        Toast.success(response.message)
        store.dispatch(updateToken(response.data.reset_token))
    } catch (error) {
    }
};

export default resendTokenSlice.reducer;
