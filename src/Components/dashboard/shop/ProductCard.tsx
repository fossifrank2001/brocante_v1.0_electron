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
    status?: string
}

const ProductCard: React.FC<ProductCardProps> = ({ id, imageUrl, name, price, oldPrice,stock_quantity, status}) => {
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

    return (
        <div className="col-sm-4 col-lg-3 col-xxl-3">
            <motion.div
                className="card hover-img overflow-hidden   border border-1 border-lightgray"
                style={{boxShadow: "0 0 5px lightgray", borderRadius: "12px"}}
                whileHover={{ y: -10 }}
            >
                <div className="position-relative">
                    {imageUrl ? <a href="#" style={{height: '100px'}}>
                            <img src={Constants.URL +"/"+ imageUrl} className="card-img-top" style={{
                                height: '125px', objectFit:"cover", objectPosition:"center"}}  alt={name}/>
                        </a>
                        :
                        <a href="#" style={{height: '100px'}}>
                            <img src={noImage as never} className="card-img-top" style={{height: '125px',
                                objectFit:"cover", objectPosition:"center"}}  alt={name}/>
                        </a>
                    }
                    {(stock_quantity !== 0 && !maxHasReach)&& <a
                        href="#"
                        onClick={handleAddToCart}
                        className="text-bg-primary rounded-circle p-2 text-white d-inline-flex position-absolute bottom-0 end-0 mb-n3 me-3"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title="Add To Cart"
                    >
                        <i className="ti ti-basket fs-4"></i>
                    </a>}
                </div>
                <div className="card-body pt-3 p-4">
                    <h6 className="fs-4">{name}</h6>
                    <div className="d-flex align-items-center justify-content-between">
                        <h6 className="fs-4 mb-0 w-100 d-flex align-items-center justify-content-between">
                            <span>{price} <span  className='fw-bolder' style={{fontSize: '10px'}}> FCFA</span></span>
                            {!maxHasReach ?
                                <span className={`${UtilMethods.getStatus(status)}`}>{status}</span>
                                :
                                <span className={`${UtilMethods.getStatus(ProductAPI.OUT_OF_STOCK)}`}>{ProductAPI.OUT_OF_STOCK}</span>
                            }
                        </h6>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductCard;
