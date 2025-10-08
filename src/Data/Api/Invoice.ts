import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import {IInvoice} from "Interfaces";

interface IPayInvoicePayload {
    amount: number;
    payment_method: string;
}

interface IUseCustomerBalancePayload {
    customer_id: number;
}

export interface IBalanceUsageResult {
    covered_debts: Array<{
        sale_id: string;
        amount_covered: number;
        paid_with: 'customer_balance' | 'excess_payment';
    }>;
    remaining_debts: Array<{
        sale_id: string;
        remaining_amount: number;
    }>;
    balance_used: number;
    remaining_balance: number;
}

export interface IUseCustomerBalanceResponse {
    affected_sells: any[];
    balance_usage: IBalanceUsageResult;
    customer: {
        id: number;
        name: string;
        previous_balance: number;
        new_balance: number;
        balance_used: number;
    };
}


class InvoiceAPI {
    static async pay(invoice: number, payload: IPayInvoicePayload): Promise<IApiResponseBase<IInvoice>> {
        try {
            
            const response = await axiosInstance.post<IApiResponseBase<IInvoice>>(`/invoices/pay/${invoice}`, payload);
            return response.data as any;
        } catch (error) {
            console.error('Error paying invoice:', error);
            throw error;
        }
    }

    static async show(invoice: number): Promise<IApiResponseBase<IInvoice>> {
        try {
            const response = await axiosInstance.get<IApiResponseBase<IInvoice>>(`/invoices/${invoice}`);
            return response.data as any;
        } catch (error) {
            console.error('Error showing invoice:', error);
            throw error;
        }
    }

    static async useCustomerBalance(payload: IUseCustomerBalancePayload): Promise<IApiResponseBase<IUseCustomerBalanceResponse>> {
        try {
            const response = await axiosInstance.post<IApiResponseBase<IUseCustomerBalanceResponse>>('/invoices/use-customer-balance', payload);
            return response.data;
        } catch (error) {
            console.error('Error using customer balance:', error);
            throw error;
        }
    }
}

export default InvoiceAPI;
