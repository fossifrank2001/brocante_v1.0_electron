import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pages, NavigationState } from 'Data/Objects/state';

// État par défaut
const initialState: NavigationState = {
    currentPage: localStorage.getItem('hasSeenOnboarding') && Boolean(localStorage.getItem('hasSeenOnboarding')) ? Pages.HOME : Pages.ONBOARDING,
    id: null,
    param: null,
    search: null,
    lastPageBeforeLogin: undefined,
};

export interface IPageHandler{
    page: Pages,
    id?: number| never | null,
    param?: {
        type ?: string
        number ?: string
    } | null,
    search?: {
        type ?: string
        value ?: string
    }
}

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setActivePage: (state, action: PayloadAction<Partial<IPageHandler>>) => {
            const {page, id, param, search} = action.payload
            state.currentPage = page;
            state.id = id ?? null;
            state.param = param ?? null;
            state.search = search ?? null;
            
            // Si l'utilisateur quitte l'onboarding, marquer comme vu et rediriger vers HOME
            if (state.currentPage !== Pages.ONBOARDING && (!localStorage.getItem('hasSeenOnboarding') || !localStorage.getItem('hasSeenOnboarding'))) {
                localStorage.setItem('hasSeenOnboarding', '1');
                state.currentPage = Pages.HOME;
            }
        },
        redirectToLogin: (state: NavigationState) => {
            if (localStorage.getItem('hasSeenOnboarding') && Boolean(localStorage.getItem('hasSeenOnboarding'))) {
                state.currentPage = Pages.LOGIN;
            } else {
                state.currentPage = Pages.ONBOARDING;
            }
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
    redirectToLogin,
    setLastPageBeforeLogin,
    resetLastPageBeforeLogin
} = navigationSlice.actions;

export default navigationSlice.reducer;
