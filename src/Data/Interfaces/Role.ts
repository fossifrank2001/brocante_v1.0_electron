import { ILink } from "Data/Interfaces";
import { ReactNode } from 'react';

export interface IRoleList {
    success: boolean;
    data: {
        current_page: number; 
        data: IRole[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: ILink[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
    message: string;
}

export interface IRole {
    id: number;
    label: string;
    code: string;
}
export interface IRoleTableData extends IRole{
    actions: ReactNode;
}
