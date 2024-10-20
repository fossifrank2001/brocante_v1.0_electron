import { ILink } from 'Data/Interfaces/index.ts';
import { ReactNode } from 'react';

export interface IPerson{
    id ?: number;
    lastname : string;
    firstname : string;
    phone : string;
    company_balance?: number;
    remaining_balance?: string;
}

export interface IPersonList{
    success: boolean;
    data: IPerson[] ;
    message: string;
}

export interface IPersons {
    current_page: number;
    data: IPerson[];
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

export interface IPersonTableData extends IPerson {
    actions: ReactNode;
}