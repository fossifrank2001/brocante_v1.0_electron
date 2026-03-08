export interface ICashSession {
    id: number;
    user_id: number;
    access_id: number | null;
    session_code: string;
    status: 'open' | 'closed' | 'suspended';
    opening_balance: number;
    closing_balance: number | null;
    expected_cash: number | null;
    actual_cash: number | null;
    difference: number | null;
    total_sales: number;
    sales_count: number;
    total_cash_payments: number;
    total_refunds: number;
    notes: string | null;
    opened_at: string;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ICashSessionOpenPayload {
    opening_balance: number;
    notes?: string;
}

export interface ICashSessionClosePayload {
    actual_cash: number;
    notes?: string;
}

export interface ICashSessionSummary {
    session: ICashSession;
    sells: any[];
    stats: {
        sales_count: number;
        canceled_count: number;
        total_sales: number;
        total_cash_payments: number;
        total_refunds: number;
        opening_balance: number;
        expected_cash: number;
        actual_cash: number | null;
        difference: number | null;
    };
}
