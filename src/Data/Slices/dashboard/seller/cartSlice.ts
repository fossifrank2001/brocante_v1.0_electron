import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from "Data/Objects/store";

// LocalStorage key for cart persistence
const CART_STORAGE_KEY = 'brocante_cart_state';

interface IProduct {
    id: number;
    imageUrl: string;
    name: string;
    price: number;
    oldPrice?: number;
    quantity: number;
}

export interface CartItem {
    product: IProduct;
    quantity: number;
    subtotal: number;
}

export interface ICartState {
    items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
}

// Load cart from localStorage if available
const loadCartFromStorage = (): ICartState => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            return JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
    }
    return {
        items: [],
        totalQuantity: 0,
        totalPrice: 0
    };
};

// Save cart to localStorage
const saveCartToStorage = (state: ICartState) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

const initialState: ICartState = loadCartFromStorage();

const updateCartTotals = (state: ICartState) => {
    state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
    state.totalPrice = state.items.reduce((total, item) => total + item.subtotal, 0);
    saveCartToStorage(state);
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IProduct>) => {
            const { id, price } = action.payload;
            const existingItem = state.items.find(item => item.product.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.subtotal += price;
                existingItem.product.quantity -= 1;
            } else {
                state.items.push({
                    product: { ...action.payload, quantity: action.payload.quantity - 1 },
                    quantity: 1,
                    subtotal: price,
                });
            }

            updateCartTotals(state);
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            const index = state.items.findIndex(item => item.product.id === action.payload);
            if (index !== -1) {
                state.items.splice(index, 1);
                updateCartTotals(state);
            }
        },
        decreaseQuantity: (state, action: PayloadAction<{ id: number; price: number }>) => {
            const { id, price } = action.payload;
            const existingItem = state.items.find(item => item.product.id === id);

            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                    existingItem.subtotal -= price;
                    existingItem.product.quantity += 1;
                } else {
                    state.items = state.items.filter(item => item.product.id !== id);
                }
                updateCartTotals(state);
            }
        },
        updateCartItem: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product.id === id);

            if (existingItem) {
                const quantityDiff = quantity - existingItem.quantity;
                existingItem.quantity = quantity;
                existingItem.subtotal = existingItem.product.price * quantity;
                existingItem.product.quantity -= quantityDiff;

                updateCartTotals(state);
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
            localStorage.removeItem(CART_STORAGE_KEY);
        },
    },
});

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTotalQuantity = (state: RootState) => state.cart.totalQuantity;
export const selectTotalPrice = (state: RootState) => state.cart.totalPrice;

export const {
    addToCart,
    removeFromCart,
    decreaseQuantity,
    updateCartItem,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;