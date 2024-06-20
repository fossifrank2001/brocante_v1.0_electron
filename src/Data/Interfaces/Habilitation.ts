import { IMenu } from "Data/Interfaces/Menu";
import { IPermission } from "Data/Interfaces/Permission";
import { IRole } from "Data/Interfaces/Role";

export interface IHabilitation{
    id: number;
    menu_id: number;
    role_id: number;
    permission_id: number;
    permission: IPermission;
    menu: IMenu;
    role: IRole; 
    permissions?: number[];
}

export interface IHabilitationPayload{
    menu: number;
    role: number | string;
    permissions: number[];
}
