import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import {IInvoice} from "Interfaces";

interface IPayInvoicePayload {
    amount: number;
    payment_method: string;
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
            console.error('Error paying invoice:', error);
            throw error;
        }
    }
}

export default InvoiceAPI;
