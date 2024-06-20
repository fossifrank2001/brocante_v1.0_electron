import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenusState} from "Data/Objects/state";
import {IMenuList} from 'Interfaces'
import MenuAPI from 'Data/Api/Menu';
import { AppDispatch } from 'Data/Objects/store';

const initialState: MenusState = {
    menus: undefined,
    isLoading: false
};


const menusSlice = createSlice({
    name: 'menus',
    initialState,
    reducers: {
        getMenus: (state: MenusState, action: PayloadAction<IMenuList>) =>{
            const result = action.payload
            state.menus = result.data;
        },
        setIsLoading: (state: MenusState, action: PayloadAction<boolean>) =>{
            state.isLoading = action.payload;
        }
    },
});

const {setIsLoading, getMenus} = menusSlice.actions

export const loadMenusAsync = () => async (dispatch: AppDispatch) =>{
    try {
        dispatch(setIsLoading(true))
        const response: IMenuList  = await MenuAPI.menus();
        dispatch(setIsLoading(true))
        dispatch(getMenus(response));
    } catch (error) {
    }
};

export default menusSlice.reducer;

