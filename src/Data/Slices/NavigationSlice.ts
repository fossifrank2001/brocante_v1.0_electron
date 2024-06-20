import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pages, NavigationState } from 'Data/Objects/state';

// État par défaut
const initialState: NavigationState = {
    currentPage: Pages.LOGIN,
    id: null,
    param: null
};

interface IPageHandler{
    page: Pages,
    id?: number| null,
    param?: any | Object | null 
}

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setActivePage: (state, action: PayloadAction<Partial<IPageHandler>>) => {
            const {page, id, param} = action.payload
            state.currentPage = page;
            state.id = id ?? null;
            state.param = param ?? null;
        },
        redirectToLogin: (state: NavigationState) => {
            state.currentPage = Pages.LOGIN;
        }
    }
});

export const { setActivePage, redirectToLogin  } = navigationSlice.actions;

export default navigationSlice.reducer;
