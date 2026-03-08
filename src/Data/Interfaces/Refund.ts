import { ISell } from './Sell';
import { IPerson } from './Person';
import { IUser } from './User';
import { ICashSession } from './CashSession';

export interface IRefund {
    id: number;
    sell_id: number;
    person_id: number | null;
    user_id: number;
    cash_session_id: number | null;
    refund_code: string;
    amount: number;
    refund_type: 'full' | 'partial';
    payment_method: 'Cash' | 'Orange Money' | 'MTN Money' | 'Card';
    reason: string;
    created_at: string;
    updated_at: string;
    sell?: ISell;
    person?: IPerson;
    user?: IUser;
    cash_session?: ICashSession;
}

export interface IRefundCreatePayload {
    sell_id: number;
    amount: number;
    refund_type: 'full' | 'partial';
    payment_method: 'Cash' | 'Orange Money' | 'MTN Money' | 'Card';
    reason: string;
    cash_session_id?: number | null;
}

export interface IRefundBySellResponse {
    refunds: IRefund[];
    total_refunded: number;
    refundable_amount: number;
}
