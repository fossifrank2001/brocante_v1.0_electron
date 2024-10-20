import { IAccess as IAccessAlone } from "Data/Interfaces/Access";
import { ReactNode } from 'react';
import {IImage} from "Data/Interfaces/Image.ts";

export interface IUser {
    accesses: Array<IAccessAlone>;
    first_connexion: boolean;
    id: number;
    last_name?: string;
    first_name?: string;
    email: string;
    phone?: string;
    gender?: string;
    thumbnail?: IImage | null;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export interface IUserTableData extends IUser {
    name: string;
    actions: ReactNode;
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