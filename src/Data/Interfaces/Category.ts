import {ISubCategory} from "Data/Interfaces/Supply.ts";
import { ReactNode } from 'react';

export interface ICategoryPayload{
    label: string;
    description?: string;
    sub_categories: SubCategory[] | ISubCategory[];
}

export interface SubCategory {
    id?: number;
    label: string;
    description?: string;
}

export interface ICategory extends ICategoryPayload{
    id: number;
}

export interface ICategoryTableData extends ICategory {
    sub_category: number;
    actions: ReactNode;
}