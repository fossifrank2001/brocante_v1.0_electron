import { IRole } from "Data/Interfaces/Role";
import { IUser } from "Data/Interfaces/User";
import { ReactNode } from 'react';

export interface IAccessesPayload{
    user_id: number;
    role_id: number | string; 
    status: string;
    code: string;
}

export interface IAccess extends IAccessesPayload{
    id: number;
    role?: IRole | null ;
    user?: IUser | null;
}

export interface IAccessTableData extends Omit<IAccess, 'role_id'|'user_id'|'user'> {
    user: string;
    actions: ReactNode;
}