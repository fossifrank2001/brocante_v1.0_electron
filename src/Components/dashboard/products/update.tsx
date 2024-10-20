import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "Components/Breadcrumd.tsx";
import { motion } from "framer-motion";
import { setActivePage } from "Data/Slices/NavigationSlice.ts";
import { Pages } from "Data/Objects/state.ts";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useAppContext } from "@/contexts/appContext.tsx";
import { IProduct } from "Data/Interfaces/Supply.ts";
import ProductAPI from "Data/Api/Product.ts";
import { LoadingAnimation } from "Components/LoadingAnimation.tsx";
import ThumbnailDropzone from "Components/ThumbnailDropzone.tsx";
import {IImage} from "Data/Interfaces/Image.ts";
import constants from "Data/Utilities/constants.ts";

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const ProductUpdate: React.FC = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [record, setRecord] = useState<IProduct | null>(null);
    const [image, setImage] = useState<IImage | null>(null);

    useLayoutEffect(() => {
        context.togglePageLoading();
    }, [context]);

    const handleUploadSuccess = (uploadedImagePath: IImage) => {
        setImage(uploadedImagePath);
    };

    const getRecord = useCallback(
        async () => {
            try {
                const { data: __product } = await ProductAPI.show(id);
                setRecord(__product);
                setImage(__product.thumbnail);
            } catch (e) {
                console.error(e);
            }
        },
        [id],
    );

    useEffect(() => {
        getRecord();
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
                    {record ? (
                        <div className="row row-gap-2">
                            <div className="col-8 ps-3 ">
                                <MultiStepForm record={record} id={id} />
                            </div>
                            <div className='col-4'>
                                <ThumbnailDropzone
                                    onUploadSuccess={handleUploadSuccess}
                                    existingImageUrl={image ? `${constants.URL}/${image.path}` : null}
                                    existingImageId={image ? image.id : null}
                                    imageable={{
                                        imageable_id: record.id,
                                        imageable_type: 'Product'
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <LoadingAnimation />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductUpdate;
