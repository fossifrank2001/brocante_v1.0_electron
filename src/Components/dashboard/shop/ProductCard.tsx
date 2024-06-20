import React from 'react';
import { motion } from 'framer-motion';
import {useAppDispatch} from "@/hooks";
import {addToCart} from "Data/Slices/dashboard/seller/cartSlice.ts";

interface ProductCardProps {
    id:number
    imageUrl: string;
    name: string;
    price: number;
    stock_quantity:number;
    oldPrice?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, imageUrl, name, price, oldPrice,stock_quantity}) => {
    const dispatch = useAppDispatch();

    const handleAddToCart = () => {
        const productToAdd = {
            id,
            imageUrl,
            name,
            price,
            oldPrice,
            quantity: stock_quantity
        };

        // Dispatchez l'action pour ajouter ce produit au panier
        dispatch(addToCart(productToAdd));
    };

    return (
        <div className="col-sm-4 col-lg-4 col-xxl-4">
            <motion.div
                className="card hover-img overflow-hidden border border-1 "
                whileHover={{ y: -10 }}
            >
                <div className="position-relative">
                    <a href="#">
                        <img src={imageUrl} className="card-img-top" alt={name} />
                    </a>
                    <a
                        href="#"
                        onClick={handleAddToCart}
                        className="text-bg-primary rounded-circle p-2 text-white d-inline-flex position-absolute bottom-0 end-0 mb-n3 me-3"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title="Add To Cart"
                    >
                        <i className="ti ti-basket fs-4"></i>
                    </a>
                </div>
                <div className="card-body pt-3 p-4">
                    <h6 className="fs-4">{name}</h6>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="fs-4 mb-0">
                            <span>{price} <span  className='fw-bolder' style={{fontSize: '10px'}}> FCFA</span></span>
                            {oldPrice && (
                                <span className="ms-2 fw-normal text-muted fs-3">
                                  <del>${oldPrice}</del>
                                </span>
                            )}
                        </h6>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductCard;
