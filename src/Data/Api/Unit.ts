import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import { IUnit } from 'Data/Interfaces/Unit';

class UnitAPI {
    static async index(): Promise<IApiResponseBase<IUnit[]>> {
        try {
            const response = await axiosInstance.get<IApiResponseBase<IUnit[]>>('/units');
            return response.data as any;
        } catch (error) {
            throw error;
        }
    }
}

export default UnitAPI;
