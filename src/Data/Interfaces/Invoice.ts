export interface IInvoice {
    id: number;
    total_amount: number;
    invoice_date: string;
    invoice_number: string;
    amount_paid: number;
    remaining_balance: number;
    date_to_pay: string;
    sell_id: number;
    created_at?: string;
    updated_at?: string;
}