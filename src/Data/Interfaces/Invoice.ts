import {ReactNode} from "react";

export interface IInvoice {
    id: number;
    sell_code: string;
    total_amount: number;
    invoice_date: string;
    invoice_number: string;
    status: string;
    amount_paid: number;
    remaining_balance: number;
    date_to_pay: string;
    sell_id: number;
    payments: Array<never>;
    created_at?: string;
    updated_at?: string;
}

export interface IInvoiceTableData extends IInvoice {
    actions: ReactNode;
}