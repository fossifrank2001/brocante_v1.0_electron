import React from 'react';
import ProductCard from "Components/dashboard/shop/ProductCard.tsx";
import {IProduct} from "Data/Interfaces/Supply.ts";
import ProductAPI from "Data/Api/Product.ts";

interface IProductTransformed{
    id:number;
    imageUrl: string,
    name: string,
    price: number;
    oldPrice: number;
    stock_quantity: number;
}

interface ProductListProps{
    products: IProductTransformed[] | IProduct[];
}

const ProductList: React.FC<ProductListProps> = ({products}) => {
    return (
        <div className="row px-2">
            {products.map((product: any, index) => (
                <ProductCard
                    key={index}
                    id={product.id}
                    imageUrl={"thumbnail" in product ? product.thumbnail?.path : null}
                    name={product.name}
                    price={product.price}
                    oldPrice={"oldPrice" in product ? product.oldPrice : null}
                    stock_quantity={product.stock_quantity}
                    status = {product?.stock_quantity > 0? ProductAPI.STOCK : ProductAPI.OUT_OF_STOCK}
                />
            ))}
        </div>
    )
}

export default ProductList;
