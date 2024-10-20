import axiosInstance, { IApiResponseBase, IApiResponsePaginated } from 'Data/Utilities/axiosInstance';
import { IHabilitation, IHabilitationPayload } from 'Data/Interfaces/Habilitation';
import { IPermission } from 'Interfaces';


class AuthorizationAPI {
    static async index(_q = ''): Promise<IApiResponsePaginated<IHabilitation>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<IHabilitation>>(`/authorizations?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    static async permissions(_q = ''): Promise<IApiResponsePaginated<IPermission>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponsePaginated<IPermission>>(`/permissions?q=${_q}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async show(id: number): Promise<IApiResponseBase<IHabilitation>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.get<IApiResponseBase<IHabilitation>>(`/authorizations/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(roleData: Partial<IHabilitationPayload>): Promise<IApiResponseBase<IHabilitation>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.post<IApiResponseBase<IHabilitation>>('/authorizations', roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, roleData: Partial<IHabilitationPayload>): Promise<IApiResponseBase<IHabilitation>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.put<IApiResponseBase<IHabilitation>>(`/authorizations/${id}`, roleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number): Promise<IApiResponseBase<IHabilitation>> {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axiosInstance.delete(`/authorizations/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthorizationAPI;
