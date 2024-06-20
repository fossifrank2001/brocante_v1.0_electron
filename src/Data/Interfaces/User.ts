import { IAccess as IAccessAlone } from "Data/Interfaces/Access";

export interface IUser {
    id: number;
    last_name: string;
    first_name: string  | null;
    email: string;
    phone: string;
    gender: string;
    created_at: string | null;
    updated_at: string | null;
    auth_access_id: number | null;
    first_connexion: boolean;
    status: 'active' | 'inactive';
    accesses: IAccess[];
}

export interface IAccess extends IAccessAlone{}

export interface IApiUser {
    token: string;
    user: IUser;
}


export interface IApiUserLogin {
    message: string;  
    data: IApiUser
}

export interface ILoginPayload{
    login       : string;
    password    : string
}

export interface IForgotPayload {
    username: string;
}

export interface IResendTokenPayload {
    username: string;
}

export interface IResetPayload {
    token: string;
    password: string;
    password_confirmation: string;
}

export interface IAccessPayload {
    access_id: string | number;
}