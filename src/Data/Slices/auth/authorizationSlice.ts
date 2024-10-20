import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAccessPayload, IHabilitation } from 'Interfaces';
import { IApiResponseBase } from 'Data/Utilities/axiosInstance';
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
        loadAccess: (state: UserAuthorizationState, action: PayloadAction<IApiResponseBase<{
            authorizations: IHabilitation[]|null;
            auth_access_id: string;
            message: string;
            data: {
                authorizations: IHabilitation[]|null
                auth_access_id: string;
            };
        }>>)=>{
            const { data: { authorizations, auth_access_id } } = action.payload;
            state.auth_access_id = auth_access_id;
            state.authorizations = authorizations;
        }
    },
});

export const loadAuthorizationAsync = (payload: IAccessPayload) => async (dispatch: AppDispatch) =>{
    try {
        const response  = await AuthAPI.access(payload);
        const lastVisitedPage = localStorage.getItem('lastVisitedPage');

        if (lastVisitedPage) {
            store.dispatch(setActivePage({ page: lastVisitedPage }));
        } else {
            store.dispatch(setActivePage({page: Pages.DASHBOARD}))
        }
        dispatch(userAuthorizationSlice.actions.loadAccess(response));
    } catch (error) {
        console.log('Error while loading Authorizations ::: ', error)
    }
};

export default userAuthorizationSlice.reducer;
