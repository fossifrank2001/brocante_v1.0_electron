import {ICategory} from "Data/Interfaces/Category.ts";
import { ReactNode } from 'react';
import {IImage} from "Data/Interfaces/Image.ts";

export interface ISupplyPayload{
    name : string;
    contact_info : string;
    products_count: number
}

export interface ISupply extends ISupplyPayload{
    id?: number
}

export interface IProductDetail{
    size: string,
    quality_class: string,
    material: string,
    color: string,
    brand: string,
    model: string,
    weight: string,
    dimensions: string,
    power: string,
    voltage: string,
    capacity: string,
    pressure: string,
    temperature: string,
    usage: string,
    features: string,
    notes: string,
    warranty: string,
    compatibility: string,
    finish: string,
    shape: string,
    style: string,
    pattern: string,
    grade: string,
    texture: string,
    application: string,
    gauge: string,
    diameter: string,
    length: string,
    width: string,
    height: string,
    thickness: string,
    capacity_volume: string,
    capacity_weight: string,
    flow_rate: string,
    voltage_rating: string,
    current_rating: string,
}


export interface IProduct{
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    description: string;
    thumbnail?: IImage | null;
    details: IProductDetail;
    suppliers: ISupplyPayload[]
    subcategories: ISubCategory[]
    created_at: string;
    updated_at: string;
}

export interface ISubCategory{
    id	:number;
    label: string;
    description: string
    category_id: number;
    category: ICategory;
}

export interface IProductTableData extends IProduct{
    status:string;
    actions: ReactNode;
}