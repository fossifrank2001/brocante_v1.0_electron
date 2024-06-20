import React, {useEffect, useLayoutEffect, useState} from 'react';
import MultiStepForm from "Components/dashboard/products/formSteps";
import Breadcrumd from "Components/Breadcrumd.tsx";
import {motion} from "framer-motion";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import {useAppDispatch} from "@/hooks";
import {useAppContext} from "@/contexts/appContext.tsx";
import ThumbnailDropzone from "Components/ThumbnailDropzone.tsx";

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const ProductCreate: React.FC = () => {
    const dispatch = useAppDispatch();
    const context = useAppContext();
    const [_, setFile] = useState(null);
    //const [initialImageUrl, setInitialImageUrl] = useState('');

    useEffect(() => {
        // Remplacez l'URL par l'URL de votre API pour récupérer l'image initiale
        /*axios.get('/api/product/initial-image-url')
            .then(response => {
                setInitialImageUrl(response.data.imageUrl);
            })
            .catch(error => {
                console.error('Error fetching initial image:', error);
            });*/
    }, []);

    const handleDrop = (acceptedFile) => {
        setFile(acceptedFile);

        const formData = new FormData();
        formData.append('file', acceptedFile);

        console.log(formData)
    };

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
                        <div className="col-8 ps-3 ">
                            <MultiStepForm  />
                        </div>
                        <div className='col-4'>
                            <ThumbnailDropzone onDrop={handleDrop} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreate;
