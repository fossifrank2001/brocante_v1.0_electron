import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'Data/Objects/store';
import { CartItem, TDiscountMode } from './cartSlice';

const HELD_ORDERS_STORAGE_KEY = 'brocante_held_orders';

export interface IHeldOrder {
    id: string;
    label: string;
    createdAt: string;
    customerName?: string;
    items: CartItem[];
    totalPrice: number;
    totalQuantity: number;
    globalDiscountValue: number;
    globalDiscountMode: TDiscountMode;
}

interface IHeldOrdersState {
    orders: IHeldOrder[];
}

const loadFromStorage = (): IHeldOrder[] => {
    try {
        const raw = localStorage.getItem(HELD_ORDERS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (error) {
        console.error('Error loading held orders from localStorage:', error);
    }
    return [];
};

const saveToStorage = (orders: IHeldOrder[]) => {
    try {
        localStorage.setItem(HELD_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving held orders to localStorage:', error);
    }
};

const initialState: IHeldOrdersState = {
    orders: loadFromStorage(),
};

export const heldOrdersSlice = createSlice({
    name: 'heldOrders',
    initialState,
    reducers: {
        holdOrder: (state, action: PayloadAction<Omit<IHeldOrder, 'id' | 'createdAt'>>) => {
            const order: IHeldOrder = {
                ...action.payload,
                id: `HOLD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date().toISOString(),
            };
            state.orders.unshift(order);
            saveToStorage(state.orders);
        },
        removeHeldOrder: (state, action: PayloadAction<string>) => {
            state.orders = state.orders.filter(o => o.id !== action.payload);
            saveToStorage(state.orders);
        },
        clearHeldOrders: (state) => {
            state.orders = [];
            localStorage.removeItem(HELD_ORDERS_STORAGE_KEY);
        },
    },
});

export const selectHeldOrders = (state: RootState) => state.heldOrders.orders;
export const selectHeldOrdersCount = (state: RootState) => state.heldOrders.orders.length;

export const { holdOrder, removeHeldOrder, clearHeldOrders } = heldOrdersSlice.actions;

export default heldOrdersSlice.reducer;
