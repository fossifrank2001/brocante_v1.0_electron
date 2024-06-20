import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {RootState} from "Data/Objects/store.ts";

interface IProduct {
    id: number;
    imageUrl: string;
    name: string;
    price: number;
    oldPrice?: number;
    quantity: number;
}

interface CartItem {
    product: IProduct;
    quantity: number;
    subtotal: number;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IProduct>) => {
            const { id } = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.product.id === id);
            if (existingItemIndex !== -1) {
                state.items[existingItemIndex].quantity += 1;
                state.items[existingItemIndex].subtotal += state.items[existingItemIndex].product.price;
            } else {
                const newCartItem: CartItem = {
                    product: action.payload,
                    quantity: 1,
                    subtotal: action.payload.price,
                };
                state.items.push(newCartItem);
            }
            state.totalQuantity += 1;
        },

        removeFromCart: (state, action: PayloadAction<number>) => {
            const productIdToRemove = action.payload;
            const existingItem = state.items.find(item => item.product.id === productIdToRemove);
            if (existingItem) {
                state.items = state.items.filter(item => item.product.id !== productIdToRemove);
                state.totalQuantity -= existingItem.quantity;
            }
        },
        decreaseQuantity: (state, action: PayloadAction<number>) => {
            const productIdToDecrease = action.payload;
            const existingItem = state.items.find(item => item.product.id === productIdToDecrease);
            if (existingItem && existingItem.quantity > 1) {
                existingItem.quantity -= 1;
                state.totalQuantity -= 1;
            } else if (existingItem && existingItem.quantity === 1) {
                state.items = state.items.filter(item => item.product.id !== productIdToDecrease);
                state.totalQuantity -= 1;
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
        },
    },
});

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTotalQuantity = (state: RootState) => state.cart.totalQuantity;

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
