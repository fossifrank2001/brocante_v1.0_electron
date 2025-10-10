import {IPerson} from "Data/Interfaces/Person.ts";
import { ReactNode } from 'react';

export interface ISellPayload {
    total_amount: number;
    transaction_type: TTransactionType;
    amount_paid: number;
    remaining_balance?: number;
    date_to_pay?: string;
    person_id: string | number;
    payment: TPayment;
    tax: number;
    shipping_price: number;
    items: Item[];
    has_authorized?: boolean;
    use_company_balance?: boolean;
    use_surplus_for_debts?: boolean;
}

export type TTransactionType = 'total' | 'advance' | 'loan';
export type TPayment = 'Cash' | 'Orange Money' | 'MTN Money';
export type TSellStatus = 'pending' | 'partially_paid' | 'paid' | 'canceled' ;

export interface Item {
    product_id: number ;
    price: number ;
    quantity: number ;
    total_unit: number ;
}


export interface ISell {
    id: number;
    user_id: number;
    person_id: number;
    sell_code: string | number;
    cancel_reason ?: string;
    transaction_type: TTransactionType;
    total_amount: number;
    status:  TSellStatus;
    created_at?: string;
    updated_at?: string;
    payments?: never[]|null;
    person ?: null | Partial<IPerson>
}

export interface ISellTableData extends Omit<ISell, 'person_id'> {
    person_id: string;
    actions: ReactNode;
}