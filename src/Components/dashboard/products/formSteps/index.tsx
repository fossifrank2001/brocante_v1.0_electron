import React, { useState } from 'react';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import ProductInfo from "Components/dashboard/products/formSteps/ProductInfo.tsx";
import SupplierInfo from "Components/dashboard/products/formSteps/SupplierInfo.tsx";
import ProductDetails from "Components/dashboard/products/formSteps/ProductDetails.tsx";
import "Styles/Product.less"
import {IProductPayload} from "Data/Interfaces/Product.ts";
import ProductAPI from "Data/Api/Product.ts";
import {useAppDispatch} from "@/hooks";
import {setActivePage} from "Data/Slices/NavigationSlice.ts";
import {Pages} from "Data/Objects/state.ts";
import {useAppContext} from "@/contexts/appContext.tsx";
import {IProduct} from "Data/Interfaces/Supply.ts";


interface FormValues  extends  IProductPayload{}

const stepVariants = {
    hidden: { opacity: 0},
    visible: { opacity: 1},
    exit: { opacity: 0 },
};

interface IMultiFormProps{
    record?: IProduct;
    id?:number
}

const MultiStepForm: React.FC<IMultiFormProps> = ({record, id}) => {
    const [step, setStep] = useState(0);
    const steps = ['Product Info', 'Product Details', 'Supplier Info'];
    const isLastStep = step === steps.length - 1;
    const dispatch = useAppDispatch()
    const context = useAppContext()

    const initialValues: FormValues = {
        name:  record?.name ?? '',
        description: record?.description ?? '',
        price: record?.price ?? 0,
        stock_quantity: record?.stock_quantity ?? 0,
        subcategory_ids: record?.subcategories ?? [],
        suppliers: record?.suppliers ?? [
            {
                name: '',
                contact_info: '',
            },
        ],
        product_details: {
            size: record?.details?.size ?? "",
            quality_class: record?.details?.quality_class ?? "",
            material: record?.details?.material ?? "",
            color: record?.details?.color ?? "",
            brand: record?.details?.brand ?? "",
            model: record?.details?.model ?? "",
            weight: record?.details?.weight ?? "",
            dimensions: record?.details?.dimensions ?? "",
            power: record?.details?.power ?? "",
            voltage: record?.details?.voltage ?? "",
            capacity: record?.details?.capacity ?? "",
            pressure: record?.details?.pressure ?? "",
            temperature: record?.details?.temperature ?? "",
            usage: record?.details?.usage ?? "",
            features: record?.details?.features ?? "",
            notes: record?.details?.notes ?? "",
            warranty: record?.details?.warranty ?? "",
            compatibility: record?.details?.compatibility ?? "",
            finish: record?.details?.finish ?? "",
            shape: record?.details?.shape ?? "",
            style: record?.details?.style ?? "",
            pattern: record?.details?.pattern ?? "",
            grade: record?.details?.grade ?? "",
            texture: record?.details?.texture ?? "",
            application: record?.details?.application ?? "",
            gauge: record?.details?.gauge ?? "",
            diameter: record?.details?.diameter ?? "",
            length: record?.details?.length ?? "",
            width: record?.details?.width ?? "",
            height: record?.details?.height ?? "",
            thickness: record?.details?.thickness ?? "",
            capacity_volume: record?.details?.capacity_volume ?? "",
            capacity_weight: record?.details?.capacity_weight ?? "",
            flow_rate: record?.details?.flow_rate ?? "",
            voltage_rating: record?.details?.voltage_rating ?? "",
            current_rating: record?.details?.current_rating ?? "",
        },
    };

    const validationSchema = [
        Yup.object({
            name: Yup.string().required('Name is required'),
            description: Yup.string(),
            price: Yup.number().required('Price is required').positive('Must be positive'),
            stock_quantity: Yup.number().required('Stock quantity is required').positive('Must be positive'),
            subcategory_ids: Yup.array().of(Yup.object().shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            })).min(1, 'At least one sub-categories is required'),
        }),
        Yup.object({
            product_details: Yup.object({
                size: Yup.string(),
                quality_class: Yup.string(),
                material: Yup.string(),
                color: Yup.string(),
                brand: Yup.string(),
                model: Yup.string(),
                weight: Yup.string(),
                dimensions: Yup.string(),
                power: Yup.string(),
                voltage: Yup.string(),
                capacity: Yup.string(),
                pressure: Yup.string(),
                temperature: Yup.string(),
                usage: Yup.string(),
                features: Yup.string(),
                notes: Yup.string(),
                warranty: Yup.string(),
                compatibility: Yup.string(),
                finish: Yup.string(),
                shape: Yup.string(),
                style: Yup.string(),
                pattern: Yup.string(),
                grade: Yup.string(),
                texture: Yup.string(),
                application: Yup.string(),
                gauge: Yup.string(),
                diameter: Yup.string(),
                length: Yup.string(),
                width: Yup.string(),
                height: Yup.string(),
                thickness: Yup.string(),
                capacity_volume: Yup.string(),
                capacity_weight: Yup.string(),
                flow_rate: Yup.string(),
                voltage_rating: Yup.string(),
                current_rating: Yup.string(),
            }),
        }),
        Yup.object({
            suppliers: Yup.array().of(
                Yup.object({
                    name: Yup.string().required('Name is equired'),
                    contact_info: Yup.string().required('Contact info is required'),
                })
            ).min(1, 'At least one supplier is required'),
        }),
    ];

    const handleSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
        if (isLastStep) {
            try {
                if(record && id){
                    await ProductAPI.update(id, values)
                }else{
                    await ProductAPI.create(values);
                }
                actions.resetForm();
                context.togglePageLoading(true);
                dispatch(setActivePage({ page: Pages.ARTICLE }));
            } catch (error) {
                console.error(error);
            }
        } else {
            setStep(step + 1);
        }
        actions.setSubmitting(false);
    };

    return (
        <div className="container px-0">
            <div className="stepper mt-4">
                <ul className="d-flex justify-content-between">
                    {steps.map((label, index) => (
                        <li
                            key={index}
                            className={`stepper-item ${index <= step ? 'completed' : ''}`}
                        >
                            <motion.div
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5}}
                                className='d-flex justify-content-center align-items-center'
                            >
                                <span className='indice me-1'>{index + 1}</span>
                                <span className='label'>{label}</span>
                            </motion.div>
                        </li>
                    ))}
                </ul>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[step]}
                onSubmit={handleSubmit}
            >
                {(formik: FormikProps<FormValues>) => (
                    <Form>
                        <div className='px-2' style={{maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', overflowX: 'hidden'}}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={stepVariants}
                                    transition={{type: 'spring', stiffness: 300, damping: 30}}
                                    className="mb-1"
                                >
                                    {step === 0 && <ProductInfo categoryRecord={record ? record.subcategories[0]?.category : null}/>}
                                    {step === 1 && <ProductDetails/>}
                                    {step === 2 && <SupplierInfo suppliersRecord={record ? record.suppliers : null}/>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="row mt-3">
                            <div className="col-12 mx-auto">
                                <div className="d-flex justify-content-between">
                                    {step > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setStep(step - 1)}
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={formik.isSubmitting || !formik.isValid}
                                    >
                                        {isLastStep ? 'Submit' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MultiStepForm;
