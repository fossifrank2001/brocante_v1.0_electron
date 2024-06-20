import { IRole } from "Data/Interfaces/Role";
import { IUser } from "Data/Interfaces/User";

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