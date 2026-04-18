import { SubCategory } from 'Data/Interfaces/Category.ts';
import {IProductDetail, ISupply} from "Data/Interfaces/Supply.ts";

export interface IProductPayload {
    name: string;
    manufacturer_reference?: string;
    internal_reference: string;
    barcode?: string;
    qrcode_data?: string;
    description: string;
    price: number;
    cost_price?: number | null;
    stock_quantity: number;
    stock_alert_threshold?: number | null;
    subcategory_ids: SubCategory[];
    suppliers: ISupply[];
    product_details: Partial<IProductDetail>;
    category?: string;
    unit_id?: number | null;
    price_per_unit?: number | null;
    template_id?: number | null;
    template_values?: Record<string, any> | null;
}