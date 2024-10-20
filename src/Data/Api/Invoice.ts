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
            return response.data;
        } catch (error) {
            console.error('Error paying invoice:', error);
            throw error;
        }
    }
}

export default InvoiceAPI;
