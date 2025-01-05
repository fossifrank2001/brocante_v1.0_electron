import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from "Data/Objects/store";
import { FormValues } from "Components/cart/MultiStepFormCart";

interface CheckoutState {
    currentStep: number;
    formData: Partial<FormValues> | null;
    returnUrl: string | null;
}

const defaultState: CheckoutState = {
    currentStep: 0,
    formData: null,
    returnUrl: null
};

// Charger l'état du checkout depuis le localStorage
const loadCheckoutFromStorage = (): CheckoutState => {
    try {
        const savedCheckout = localStorage.getItem('checkout_state');
        return savedCheckout ? JSON.parse(savedCheckout) : defaultState;
    } catch {
        return defaultState;
    }
};

const saveCheckoutToStorage = (state: CheckoutState) => {
    try {
        localStorage.setItem('checkout_state', JSON.stringify(state));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du checkout:', error);
    }
};

const initialState: CheckoutState = loadCheckoutFromStorage();

export const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        saveCheckoutState: (state, action: PayloadAction<{ step: number; formData: Partial<FormValues> }>) => {
            state.currentStep = action.payload.step;
            state.formData = action.payload.formData;
            saveCheckoutToStorage(state);
        },
        setReturnUrl: (state, action: PayloadAction<string>) => {
            state.returnUrl = action.payload;
            saveCheckoutToStorage(state);
        },
        clearCheckoutState: (state) => {
            state.currentStep = 0;
            state.formData = null;
            state.returnUrl = null;
            localStorage.removeItem('checkout_state');
        }
    }
});

export const selectCheckoutState = (state: RootState) => state.checkout;

export const {
    saveCheckoutState,
    setReturnUrl,
    clearCheckoutState
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
