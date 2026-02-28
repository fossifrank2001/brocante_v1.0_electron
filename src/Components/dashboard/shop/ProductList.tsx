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
    showFilters?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({products, showFilters = true}) => {
    // When filters are shown: 4 per row on lg+ => col-lg-3
    // When filters are hidden: 6 per row on lg+ => col-lg-2
    const columnClass = showFilters
        ? 'col-6 col-md-4 col-lg-3 col-xxl-3'
        : 'col-6 col-md-4 col-lg-2 col-xxl-2';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 3 }}> 
            {products.map((product: any, index) => (
                <ProductCard
                    key={index}
                    columnClass=''
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
