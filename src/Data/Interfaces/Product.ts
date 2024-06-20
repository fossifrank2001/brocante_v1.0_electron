import {SubCategory} from "Data/Interfaces/Category.ts";
import {IProductDetail, ISupply} from "Data/Interfaces/Supply.ts";

export interface IProductPayload {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    subcategory_ids: SubCategory[];
    suppliers: ISupply[];
    product_details: Partial<IProductDetail>;
}