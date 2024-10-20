import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pages, NavigationState } from 'Data/Objects/state';

// État par défaut
const initialState: NavigationState = {
    currentPage: Pages.HOME,
    id: null,
    param: null,
    lastPageBeforeLogin: undefined,
};

interface IPageHandler{
    page: Pages,
    id?: number| never | null,
    param?: {
        type ?: string
        number ?: string
    } | null
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
        },
        setLastPageBeforeLogin(state, action: PayloadAction<{ page: Pages }>) {
            state.lastPageBeforeLogin = action.payload.page;
        },
        resetLastPageBeforeLogin(state) {
            state.lastPageBeforeLogin = undefined;
        },
    }
});

export const {
    setActivePage,
    redirectToLogin ,
    setLastPageBeforeLogin,
    resetLastPageBeforeLogin
} = navigationSlice.actions;

export default navigationSlice.reducer;
