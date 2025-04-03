import {ReactNode} from "react";

export interface IInvoice {
    id: number;
    sell_code: string;
    total_amount: number;
    invoice_date?: string;
    invoice_number: string;
    status: string;
    amount_paid: number;
    remaining_balance: number;
    date_to_pay?: string;
    sell_id?: number;
    payments?: Array<{
        id: number;
        invoice_number: string;
        amount: number;
        payment_method: string;
        created_at: string;
    }>;
    created_at?: string;
    updated_at?: string;
    customer?: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
    };
    payment_details?: {
        invoice_number: string;
        amount_paid: number;
        excess_amount: number;
    };
}

export interface IInvoiceTableData extends IInvoice {
    actions: ReactNode;
}