import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IApiResponse } from "Data/Utilities/axiosInstance";
import {  MenuRoleState} from "Data/Objects/state";
import {IMenuRole} from 'Interfaces'
import MenuAPI from 'Data/Api/Menu';
import { AppDispatch } from 'Data/Objects/store';

const initialState: MenuRoleState = {
    menus_role: null,
};


const menuRoleSlice = createSlice({
    name: 'menus_role',
    initialState,
    reducers: {
        loadMenuByRole: (state: MenuRoleState, action: PayloadAction<IApiResponse>) =>{
            const result : IMenuRole = action.payload.data
            state.menus_role = result.menus_role;
        }
    },
});

export const loadMenuByRoleAsync = (payload: number) => async (dispatch: AppDispatch) =>{
    try {
        const response: IApiResponse  = await MenuAPI.menusByRole(payload);
        dispatch(menuRoleSlice.actions.loadMenuByRole(response));
    } catch (error) {
    }
};

export default menuRoleSlice.reducer;
