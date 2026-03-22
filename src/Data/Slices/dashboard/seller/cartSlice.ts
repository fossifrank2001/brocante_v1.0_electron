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
    unitAbbreviation?: string;
    allowsDecimal?: boolean;
    pricePerUnit?: number | null;
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

const loadCartFromStorage = (): ICartState => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            // Ensure numeric values after parse (handle undefined/null safely)
            const safeNumber = (val: unknown): number => {
                if (val === undefined || val === null || val === '') return 0;
                const n = Number(val);
                return isNaN(n) ? 0 : n;
            };
            return {
                items: (parsed.items || []).map((item: CartItem) => ({
                    ...item,
                    quantity: safeNumber(item.quantity),
                    subtotal: safeNumber(item.subtotal),
                    product: {
                        ...item.product,
                        price: safeNumber(item.product?.price),
                        quantity: safeNumber(item.product?.quantity),
                        pricePerUnit: item.product?.pricePerUnit != null ? safeNumber(item.product.pricePerUnit) : null,
                    }
                })),
                totalQuantity: safeNumber(parsed.totalQuantity),
                totalPrice: safeNumber(parsed.totalPrice)
            };
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
    state.totalQuantity = state.items.reduce((total, item) => total + (item.quantity || 0), 0);
    state.totalPrice = state.items.reduce((total, item) => total + (item.subtotal || 0), 0);
    saveCartToStorage(state);
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IProduct>) => {
            const { id, price } = action.payload;
            const existingItem = state.items.find(item => item.product.id === id);
            // Safe number conversion
            const numericPrice = price != null ? Number(price) : 0;
            if (isNaN(numericPrice)) return;

            if (existingItem) {
                existingItem.quantity = Math.round(((existingItem.quantity || 0) + 1) * 1000) / 1000;
                existingItem.subtotal = Math.round((existingItem.quantity * numericPrice) * 100) / 100;
                existingItem.product.quantity = Math.round(((existingItem.product.quantity || 0) - 1) * 1000) / 1000;
            } else {
                const productQty = action.payload.quantity != null ? Number(action.payload.quantity) : 0;
                state.items.push({
                    product: { 
                        ...action.payload, 
                        quantity: Math.round(Math.max(0, productQty - 1) * 1000) / 1000 
                    },
                    quantity: 1,
                    subtotal: Math.round(numericPrice * 100) / 100,
                });
            }

            updateCartTotals(state);
        },
        addToCartWithQuantity: (state, action: PayloadAction<{ product: IProduct; qty: number }>) => {
            const { product, qty } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);
            // Safe number conversion with fallback to 0
            const unitPrice = product.pricePerUnit != null ? Number(product.pricePerUnit) : (product.price != null ? Number(product.price) : 0);
            const numericQty = qty != null ? Number(qty) : 0;
            if (isNaN(unitPrice) || isNaN(numericQty) || numericQty <= 0) return;

            if (existingItem) {
                existingItem.quantity = Math.round(((existingItem.quantity || 0) + numericQty) * 1000) / 1000;
                existingItem.subtotal = Math.round((existingItem.quantity || 0) * unitPrice * 100) / 100;
                existingItem.product.quantity = Math.round(((existingItem.product.quantity || 0) - numericQty) * 1000) / 1000;
            } else {
                const productQty = product.quantity != null ? Number(product.quantity) : 0;
                state.items.push({
                    product: { 
                        ...product, 
                        quantity: Math.round(Math.max(0, productQty - numericQty) * 1000) / 1000,
                        price: unitPrice
                    },
                    quantity: numericQty,
                    subtotal: Math.round(numericQty * unitPrice * 100) / 100,
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
            const numericPrice = price != null ? Number(price) : 0;
            const existingItem = state.items.find(item => item.product.id === id);

            if (existingItem) {
                const currentQty = existingItem.quantity || 0;
                if (currentQty > 1) {
                    existingItem.quantity = Math.round((currentQty - 1) * 1000) / 1000;
                    existingItem.subtotal = Math.round((existingItem.quantity * numericPrice) * 100) / 100;
                    existingItem.product.quantity = Math.round(((existingItem.product.quantity || 0) + 1) * 1000) / 1000;
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
                const numericQty = quantity != null ? Number(quantity) : 0;
                const numericCurrentQty = existingItem.quantity || 0;
                const quantityDiff = numericQty - numericCurrentQty;
                const unitPrice = existingItem.product.pricePerUnit != null 
                    ? Number(existingItem.product.pricePerUnit) 
                    : (existingItem.product.price != null ? Number(existingItem.product.price) : 0);
                
                if (isNaN(numericQty) || isNaN(unitPrice)) return;
                
                existingItem.quantity = numericQty;
                existingItem.subtotal = Math.round(numericQty * unitPrice * 100) / 100;
                existingItem.product.quantity = (existingItem.product.quantity || 0) - quantityDiff;

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
    addToCartWithQuantity,
    removeFromCart,
    decreaseQuantity,
    updateCartItem,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;