import { ReactNode } from "react";

export interface IDebtCoverage {
    sale_id: string;
    amount_covered: number;
    paid_with?: 'excess_payment' | 'customer_balance';
}

export interface IRemainingDebt {
    sale_id: string;
    remaining_amount: number;
}

export interface IPaymentDetails {
    invoice_number: string;
    amount_paid: number;
    excess_amount: number;
    remaining_balance: number;
}

export interface IDebtCoverageInfo {
    covered_debts: IDebtCoverage[];
    remaining_debts: IRemainingDebt[];
    amount_to_balance: number;
}

export interface IPayment {
    id: number;
    invoice_number: string;
    amount: number;
    payment_method: string;
    created_at: string;
    updated_at: string;
}

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
    sell?: any;
    payments: IPayment[];
    created_at?: string;
    updated_at?: string;
    payment_details?: IPaymentDetails;
    debt_coverage?: IDebtCoverageInfo;
    customer?: {
        id: number;
        first_name: string;
        last_name: string;
        company_balance: number;
    };
}

export interface IInvoiceTableData extends IInvoice {
    actions: ReactNode;
}