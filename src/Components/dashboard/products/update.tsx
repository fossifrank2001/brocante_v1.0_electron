import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "Components/Breadcrumd.tsx";
import {motion} from "framer-motion";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useAppContext} from "@/contexts/appContext.tsx";
import {IProduct} from "Data/Interfaces/Supply.ts";
import ProductAPI from "Data/Api/Product.ts";
import {LoadingAnimation} from "Components/LoadingAnimation.tsx";

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const ProductUpdate: React.FC = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [record, setRecord] = useState<IProduct | null>(null);

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, []);

    const getRecord = useCallback(
        async () => {
            try{
                const {data: __product} = await ProductAPI.show(id)
                setRecord(__product)
            }catch (e) {
                console.error(e)
            }
        },
        [id],
    );
    useEffect(() => {
        getRecord()
    }, [getRecord]);


    return (
        <div className="container">
            <Breadcrumd parent="Articles" url={currentPage} _child={id} />
            <div className='card mb-0'>
                <div className='card-header'>
                    <motion.button
                        className='btn d-flex align-items-center btn-outline-dark'
                        onClick={() => {
                            dispatch(setActivePage({ page: Pages.ARTICLE }));
                        }}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <i className='ti ti-arrow-left'></i>
                        <span className='ms-1'>BACK</span>
                    </motion.button>
                </div>
                <div className='card-body mt-1 pt-1'>
                    {record ?
                        <MultiStepForm record={record} id={id}/>
                        :
                        // <div>Loading...</div>
                        <LoadingAnimation />
                    }
                </div>
            </div>
        </div>
    );
};

export default ProductUpdate;
