import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAccessPayload} from "Interfaces";
import { IApiResponse } from "Data/Utilities/axiosInstance";
import {Pages, UserAuthorizationState } from "Data/Objects/state";
import AuthAPI from 'Data/Api/Auth.ts';
import store, { AppDispatch } from '@/Data/Objects/store';
import { setActivePage } from '../NavigationSlice';

const defaultUserAuthorizationState: UserAuthorizationState = {
    auth_access_id: "",
    authorizations: null,
};


const userAuthorizationSlice = createSlice({
    name: 'userAuthorizing',
    initialState: defaultUserAuthorizationState,
    reducers: {
        loadAccess: (state: UserAuthorizationState, action: PayloadAction<IApiResponse>)=>{
            const { data: { authorizations, auth_access_id } } = action.payload;
            state.auth_access_id = auth_access_id;
            state.authorizations = authorizations;
        }
    },
});

export const loadAuthorizationAsync = (payload: IAccessPayload) => async (dispatch: AppDispatch) =>{
    try {
        const response: IApiResponse  = await AuthAPI.access(payload);
        store.dispatch(setActivePage({page: Pages.DASHBOARD}))
        dispatch(userAuthorizationSlice.actions.loadAccess(response));
    } catch (error) {
    }
};

export default userAuthorizationSlice.reducer;
