import axiosInstance, { IApiResponse } from "Data/Utilities/axiosInstance";

class Payment {
    static CASH = 'Cash'
    static ORANGE_MONEY = 'Orange Money'
    static MTN_MOMO = 'Mtn Money'

    static async index(_q: string = ''): Promise<IApiResponse> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponse>(`/payments?q=${_q}`);
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }
}

export default Payment;
