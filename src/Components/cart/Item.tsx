import React from 'react';
import {useAppDispatch} from "@/hooks";
import {addToCart, CartItem, decreaseQuantity, removeFromCart} from "Data/Slices/dashboard/seller/cartSlice.ts";
import {Link} from "@mui/material";
import Toast from "Data/Utilities/Toast.ts";

const circleButtonStyles = {
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    transform: 'scale(.75)'
}

const Item: React.FC<{item : CartItem | never; index: number}> = ({item, index}) => {
    const dispatch = useAppDispatch()

    const handleRemoveItemFromCart = () =>{
        dispatch(removeFromCart(item?.product.id))
        Toast.success('Item removed successfully.')
    }

    const handleDecreaseQuantity = () => {
        dispatch(decreaseQuantity(item?.product))
    }

    const handleIncreaseQuantity = () => {
        dispatch(addToCart({...item.product}))
    }

    return (<tr style={(() => {
        return {
            backgroundColor: "rgba(208,208,208,0.28)",
            ...(index % 2 === 0) && {transform: 'scale(.99)'}
        }
        })()}>
        <td>{index + 1}</td>
        <td>
            <h5>{item.product.name}</h5>
            <div className='stock-quanity'>
                <strong>Stock quantity:</strong>{item?.product?.quantity}
            </div>
        </td>
        <td className='d-flex align-items-center h-100'>
            <Link
                className='btn btn-secondary text-decoration-none text-white'
                style={circleButtonStyles}
                onClick={handleDecreaseQuantity}
            ><i className='ti ti-minus'></i></Link>
            <span className='mx-1'>{item.quantity}</span>
            {(item?.product?.quantity >= item.quantity) && <Link
                className='btn btn-secondary text-decoration-none text-white'
                style={circleButtonStyles}
                onClick={handleIncreaseQuantity}
            ><i className='ti ti-plus'></i></Link>}
        </td>
        <td>{item.product.price} <span className='fw-bolder' style={{fontSize: '10px'}}> FCFA</span>
        </td>
        <td className='fw-bolder'>{item.subtotal} <span className='fw-bolder' style={{fontSize: '10px'}}> FCFA</span></td>
        <td>
            <i className='ti ti-trash-off text-danger cursor-pointer' onClick={handleRemoveItemFromCart}></i>
        </td>
    </tr>
    );
};

export default Item;
