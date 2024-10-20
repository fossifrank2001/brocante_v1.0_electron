import React, {useEffect, useLayoutEffect} from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "Components/Breadcrumd.tsx";
import {motion} from "framer-motion";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import {useAppDispatch} from "@/hooks";
import {useAppContext} from "@/contexts/appContext.tsx";

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const ProductCreate: React.FC = () => {
    const dispatch = useAppDispatch();
    const context = useAppContext();

    useEffect(() => {}, []);


    useLayoutEffect(() => {
        context.togglePageLoading();
    }, []);

    return (
        <div className="container">
            <Breadcrumd parent="Articles" />
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
                    <div className="row row-gap-2">
                        <div className="col-12 ps-3 ">
                            <MultiStepForm  />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreate;
