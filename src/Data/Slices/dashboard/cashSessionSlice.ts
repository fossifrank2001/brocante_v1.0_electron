import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import CashSessionAPI from '@/Data/Api/CashSession';
import { ICashSession, ICashSessionOpenPayload, ICashSessionClosePayload } from '@/Data/Interfaces/CashSession';

interface CashSessionState {
    currentSession: ICashSession | null;
    isLoading: boolean;
    isClosing: boolean;
    error: string | null;
    sessionRequired: boolean;
}

const initialState: CashSessionState = {
    currentSession: null,
    isLoading: false,
    isClosing: false,
    error: null,
    sessionRequired: true,
};

export const fetchCurrentSession = createAsyncThunk(
    'cashSession/fetchCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await CashSessionAPI.current();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Erreur lors de la récupération de la session.');
        }
    }
);

export const openSession = createAsyncThunk(
    'cashSession/open',
    async (payload: ICashSessionOpenPayload, { rejectWithValue }) => {
        try {
            const response = await CashSessionAPI.open(payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Erreur lors de l\'ouverture de la session.');
        }
    }
);

export const closeSession = createAsyncThunk(
    'cashSession/close',
    async ({ sessionId, payload }: { sessionId: number; payload: ICashSessionClosePayload }, { rejectWithValue }) => {
        try {
            const response = await CashSessionAPI.close(sessionId, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Erreur lors de la fermeture de la session.');
        }
    }
);

const cashSessionSlice = createSlice({
    name: 'cashSession',
    initialState,
    reducers: {
        clearCashSession: (state) => {
            state.currentSession = null;
            state.error = null;
        },
        clearCashSessionError: (state) => {
            state.error = null;
        },
        incrementSalesCount: (state) => {
            if (state.currentSession) {
                state.currentSession.sales_count += 1;
            }
        },
        addToTotalSales: (state, action: PayloadAction<number>) => {
            if (state.currentSession) {
                state.currentSession.total_sales = Number(state.currentSession.total_sales) + action.payload;
                state.currentSession.total_cash_payments = Number(state.currentSession.total_cash_payments) + action.payload;
            }
        },
        addToTotalRefunds: (state, action: PayloadAction<number>) => {
            if (state.currentSession) {
                state.currentSession.total_refunds = Number(state.currentSession.total_refunds || 0) + action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch current
        builder.addCase(fetchCurrentSession.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchCurrentSession.fulfilled, (state, action) => {
            state.isLoading = false;
            const payload = action.payload as any;
            state.currentSession = payload.data ?? payload;
        });
        builder.addCase(fetchCurrentSession.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Open
        builder.addCase(openSession.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(openSession.fulfilled, (state, action) => {
            state.isLoading = false;
            const payload = action.payload as any;
            state.currentSession = payload.data ?? payload;
        });
        builder.addCase(openSession.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Close
        builder.addCase(closeSession.pending, (state) => {
            state.isClosing = true;
            state.error = null;
        });
        builder.addCase(closeSession.fulfilled, (state) => {
            state.isClosing = false;
            state.currentSession = null;
        });
        builder.addCase(closeSession.rejected, (state, action) => {
            state.isClosing = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearCashSession, clearCashSessionError, incrementSalesCount, addToTotalSales, addToTotalRefunds } = cashSessionSlice.actions;
export default cashSessionSlice.reducer;
