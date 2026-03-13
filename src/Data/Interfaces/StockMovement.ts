export interface IStockMovement {
    id: number;
    product_id: number;
    user_id: number | null;
    type: StockMovementType;
    quantity: number;
    stock_before: number;
    stock_after: number;
    reference: string | null;
    reason: string | null;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
        internal_reference: string;
    };
    user?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

export type StockMovementType =
    | 'sale'
    | 'sale_cancel'
    | 'refund'
    | 'adjustment'
    | 'purchase'
    | 'transfer_in'
    | 'transfer_out'
    | 'loss'
    | 'return'
    | 'initial';

export interface IStockMovementPayload {
    product_id: number;
    type: 'adjustment' | 'purchase' | 'loss' | 'return' | 'initial';
    quantity: number;
    reason: string;
    reference?: string;
}

export interface IStockMovementSummary {
    product: {
        id: number;
        name: string;
        current_stock: number;
    };
    summary_by_type: Array<{
        type: StockMovementType;
        count: number;
        total_quantity: number;
    }>;
    last_movement: IStockMovement | null;
    total_movements: number;
}
