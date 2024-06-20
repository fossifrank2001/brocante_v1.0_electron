import React from 'react';
import ProductCard from "Components/dashboard/shop/ProductCard.tsx";
import {IProduct} from "Data/Interfaces/Supply.ts";

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
        <div className="row">
            {products.map((product, index) => (
                <ProductCard
                    key={index}
                    id={product.id}
                    imageUrl={product.imageUrl}
                    name={product.name}
                    price={product.price}
                    oldPrice={product.oldPrice}
                    stock_quantity={product.stock_quantity}
                />
            ))}
        </div>
    )
}

export default ProductList;
