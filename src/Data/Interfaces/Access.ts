import { IRole } from "Data/Interfaces/Role";
import { IUser } from "Data/Interfaces/User";
import { ReactNode } from 'react';
import dayjs from "dayjs";

export interface IAccessesPayload{
    user_id: number;
    role_id: number | string; 
    status: string;
    code: string;
}

export interface IAccess extends IAccessesPayload{
    created_at ?: dayjs.ConfigType;
    updated_at ?: dayjs.ConfigType;
    id: number;
    role?: IRole | null ;
    user?: IUser | null;
}

export interface IAccessTableData extends Omit<IAccess, 'role_id'|'user_id'|'user'> {
    user: string;
    actions: ReactNode;
}