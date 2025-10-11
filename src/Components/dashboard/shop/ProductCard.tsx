import React, {useState} from 'react';
import { motion } from 'framer-motion';
import {useAppDispatch} from "@/hooks";
import {addToCart} from "Data/Slices/dashboard/seller/cartSlice.ts";
import noImage from  "../../../assets/images/products/no_image.png"
import UtilMethods from 'Data/Utilities/UtilMethods';
import ProductAPI from "Data/Api/Product.ts";
import Constants from "Data/Utilities/constants.ts";

interface ProductCardProps {
    id:number
    imageUrl: string;
    name: string;
    price: number;
    stock_quantity:number;
    oldPrice?: number;
    status?: string;
    columnClass?: string; // bootstrap responsive classes provided by parent
}

const ProductCard: React.FC<ProductCardProps> = ({ id, imageUrl, name, price, oldPrice, stock_quantity, status, columnClass = 'col-6 col-md-4 col-lg-3 col-xxl-3'}) => {
    const dispatch = useAppDispatch();
    const [maxHasReach, setMaxHasReach] = useState(false)
    let counter = 0
    const handleAddToCart = () => {
        counter++;
        const productToAdd = {
            id,
            imageUrl,
            name,
            price,
            oldPrice,
            quantity: stock_quantity
        };

        setMaxHasReach(counter === stock_quantity)
        dispatch(addToCart(productToAdd));
    };

    const isOutOfStock = stock_quantity <= 0 || maxHasReach;
    const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
    const discountPercent = hasDiscount ? Math.round(((oldPrice as number) - price) / (oldPrice as number) * 100) : 0;
    return (
        <div className={columnClass}>
            <motion.div
                className="card hover-img overflow-hidden border border-1 border-lightgray"
                style={{boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "12px", position: 'relative'}}
                whileHover={{ y: -6 }}
            >
                <div className="position-relative">
                    {imageUrl ? (
                        <a href="#" style={{height: '100px'}}>
                            <motion.img 
                                src={Constants.URL +"/"+ imageUrl} 
                                className="card-img-top" 
                                style={{ height: '180px', objectFit:"cover", objectPosition:"center"}}  
                                alt={name}
                                whileHover={{ scale: 1.03 }}
                                transition={{ duration: 0.25 }}
                            />
                        </a>
                    ) : (
                        <a href="#" style={{height: '100px'}}>
                            <motion.img 
                                src={noImage as never} 
                                className="card-img-top" 
                                style={{ height: '180px', objectFit:"cover", objectPosition:"center"}}  
                                alt={name}
                                whileHover={{ scale: 1.03 }}
                                transition={{ duration: 0.25 }}
                            />
                        </a>
                    )}

                    {/* Status badge */}
                    <span className={`badge position-absolute top-0 start-0 m-2 ${UtilMethods.getStatus(isOutOfStock ? ProductAPI.OUT_OF_STOCK : status)}`}>
                        {isOutOfStock ? ProductAPI.OUT_OF_STOCK : status}
                    </span>

                    {/* Discount badge */}
                    {hasDiscount && (
                        <span className="badge bg-danger position-absolute top-0 end-0 m-2" style={{opacity: 0.95}}>
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Add to cart */}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (!isOutOfStock) handleAddToCart(); }}
                        className={`rounded-circle p-2 text-white d-inline-flex position-absolute bottom-0 end-0 mb-n3 me-3 ${isOutOfStock ? 'bg-secondary disabled pointer-events-none' : 'text-bg-primary'}`}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title={isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
                        aria-disabled={isOutOfStock}
                    >
                        <i className="ti ti-basket fs-4"></i>
                    </a>
                </div>
                <div className="card-body pt-3 p-3">
                    <h6 className="fs-5 text-truncate" title={name}>{name}</h6>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                        <div className="d-flex align-items-baseline gap-2">
                            <span className="fw-bold">
                                {UtilMethods.formatNumber(price)}
                            </span>
                            {oldPrice && oldPrice > price && (
                                <span className="text-muted text-decoration-line-through" style={{fontSize: '12px'}}>
                                    {UtilMethods.formatNumber(oldPrice)}
                                </span>
                            )}
                        </div>
                        <small className="text-muted">Stock: {Math.max(0, stock_quantity - (maxHasReach ? counter : 0))}</small>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductCard;
