import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import {  MenuRoleState} from "Data/Objects/state";
import { IMenu } from 'Interfaces';
import MenuAPI from 'Data/Api/Menu';
import { AppDispatch } from 'Data/Objects/store';

const initialState: MenuRoleState = {
    menus_role: null,
    active_role: null
};


const menuRoleSlice = createSlice({
    name: 'menus_role',
    initialState,
    reducers: {
        loadMenuByRole: (state: MenuRoleState, action: PayloadAction<IApiResponseBase<{
            message: string;
            menus_role: IMenu[]
        }>>) =>{
            const result  = action.payload.data
            state.menus_role = result.menus_role;
        },
        setCurrentRole : (state: MenuRoleState, action: PayloadAction<string>) => {
            state.active_role = action.payload
        }
    },
});

export const {
    loadMenuByRole,
    setCurrentRole
} = menuRoleSlice.actions

export const loadMenuByRoleAsync = (payload: number) => async (dispatch: AppDispatch) =>{
    try {
        const response  = await MenuAPI.menusByRole(payload);
        dispatch(loadMenuByRole(response));
    } catch (error) {
        console.log('Error menu-role ::: ', error)
    }
};

export default menuRoleSlice.reducer;
