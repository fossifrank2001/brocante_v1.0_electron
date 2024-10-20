import { ILink } from '.';
import { Pages } from "../Objects/state";

export interface IMenu {
    id: number;
    parent_id: number | null;
    label: string;
    url: string | null;
    group: number;
    order: number;
    code: Pages;
}

export interface IMenus {
    current_page: number;
    data: IMenu[];
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
}


export interface IMenuList { 
    success: boolean;
    data: IMenus;
    message: string;
}


export interface IMenuRole {
    menus_role: IMenu[];
}

export interface IMenuTableData extends IMenu {
    parent: string;
}