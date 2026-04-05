import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, FormikHelpers, FormikProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { TbPackage, TbSettings, TbTruck, TbChevronRight, TbChevronLeft, TbCheck } from 'react-icons/tb';
import ProductInfo from "Components/dashboard/products/formSteps/ProductInfo";
import SupplierInfo from "Components/dashboard/products/formSteps/SupplierInfo";
import ProductDetails from "Components/dashboard/products/formSteps/ProductDetails";
import "Styles/Product.less"
import { IProductPayload } from "Data/Interfaces/Product";
import ProductAPI from "Data/Api/Product";
import { useAppDispatch } from "@/hooks";
import { setActivePage } from "Data/Slices/NavigationSlice";
import { Pages } from "Data/Objects/state";
import { useAppContext } from "@/contexts/appContext";
import { IProduct } from "Data/Interfaces/Supply";
import Toast from '@/Data/Utilities/Toast';
import DynamicTemplateForm from "Components/dashboard/products/formSteps/DynamicTemplateForm";

interface FormValues extends IProductPayload { }

// Component to auto-generate QR code when barcode or reference changes
const AutoQRCodeGenerator: React.FC<{ productId?: number }> = ({ productId }) => {
    const { values } = useFormikContext<FormValues>();
    const prevBarcode = useRef(values.barcode);
    const prevReference = useRef(values.internal_reference);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only auto-generate for existing products (update mode)
        if (!productId) return;

        const barcodeChanged = values.barcode !== prevBarcode.current;
        const referenceChanged = values.internal_reference !== prevReference.current;

        if (barcodeChanged || referenceChanged) {
            // Update refs
            prevBarcode.current = values.barcode;
            prevReference.current = values.internal_reference;

            // Clear previous timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Debounce: wait 1 second after user stops typing
            timeoutRef.current = setTimeout(async () => {
                try {
                    // Only generate if we have at least a reference
                    if (values.internal_reference) {
                        await ProductAPI.generateQRCode(productId);
                    }
                } catch (error) {
                    // Silent fail - don't disturb user experience
                    console.log('Auto QR generation failed:', error);
                }
            }, 1000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [values.barcode, values.internal_reference, productId]);

    return null; // This component doesn't render anything
};

// Bridge component that connects Formik context to DynamicTemplateForm
const TemplateFormBridge: React.FC = () => {
    const { values, setFieldValue } = useFormikContext<FormValues>();

    const subCategoryIds = (values.subcategory_ids || [])
        .filter(sub => sub && sub.id)
        .map(sub => sub.id as number);

    return (
        <Box>
            <DynamicTemplateForm
                subCategoryIds={subCategoryIds}
                templateId={values.template_id || null}
                templateValues={values.template_values || {}}
                onTemplateChange={(templateId) => setFieldValue('template_id', templateId)}
                onValuesChange={(templateValues) => setFieldValue('template_values', templateValues)}
            />
            {/* Keep legacy ProductDetails as fallback for products without a template */}
            {subCategoryIds.length === 0 && <ProductDetails />}
        </Box>
    );
};

interface IMultiFormProps {
    record?: IProduct;
    id?: number
}

const MultiStepForm: React.FC<IMultiFormProps> = ({ record, id }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { label: 'Informations', icon: <TbPackage size={20} /> },
        { label: 'Spécifications', icon: <TbSettings size={20} /> },
        { label: 'Fournisseurs', icon: <TbTruck size={20} /> }
    ];
    const isLastStep = step === steps.length - 1;
    const dispatch = useAppDispatch()
    const context = useAppContext()

    const initialValues: FormValues = {
        name: record?.name ?? '',
        internal_reference: record?.internal_reference ?? '',
        manufacturer_reference: record?.manufacturer_reference ?? '',
        barcode: record?.barcode ?? '',
        description: record?.description ?? '',
        price: record?.price ?? 0,
        stock_quantity: record?.stock_quantity ?? 0,
        unit_id: record?.unit_id ?? null,
        price_per_unit: record?.price_per_unit ?? null,
        template_id: (record as any)?.template_id ?? null,
        template_values: (record as any)?.template_values ?? {},
        category: record?.subcategories && record.subcategories.length > 0 
            ? String(record.subcategories[0].category_id) 
            : '',
        subcategory_ids: record?.subcategories?.map(sub => ({
            id: sub.id,
            label: sub.label
        })) ?? [],
        suppliers: record?.suppliers?.map(sup => ({
            id: sup.id,
            name: sup.name,
            contact_info: sup.contact_info
        })) ?? [
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
            name: Yup.string().required('Le nom est requis'),
            internal_reference: Yup.string().required('La référence interne est requise'),
            description: Yup.string(),
            price: Yup.number().required('Le prix est requis').positive('Doit être positif'),
            stock_quantity: Yup.number().required('La quantité est requise').positive('Doit être positive'),
            subcategory_ids: Yup.array().of(
                Yup.object().shape({
                    id: Yup.number().required(),
                    label: Yup.string().required(),
                })
            ).min(1, 'Au moins une sous-catégorie est requise'),
        }),
        Yup.object({
            template_values: Yup.object(),
        }),
        Yup.object({
            suppliers: Yup.array().of(
                Yup.object({
                    name: Yup.string().required('Le nom du fournisseur est requis'),
                    contact_info: Yup.string().required('Les infos de contact sont requises'),
                })
            ).min(1, 'Au moins un fournisseur est requis'),
        }),
    ];

    const handleSubmit = async (values: FormValues, actions: FormikHelpers<FormValues>) => {
        if (isLastStep) {
            try {
                // Nettoyage et typage des données avant envoi
                const payload = {
                    ...values,
                    stock_quantity: parseFloat(String(values.stock_quantity)) || 0,
                    price: parseFloat(String(values.price)) || 0,
                    subcategory_ids: (values.subcategory_ids || [])
                        .filter(sub => sub && sub.id)
                        .map(sub => sub.id),
                    suppliers: (values.suppliers || [])
                        .filter(sup => sup.name && sup.contact_info)
                        .map(sup => ({
                            id: sup.id,
                            name: sup.name,
                            contact_info: sup.contact_info
                        }))
                };

                if (record && id) {
                    await ProductAPI.update(id, payload as any);
                } else {
                    const response = await ProductAPI.create(payload as any);
                    if (response.data?.id && values.internal_reference) {
                        try {
                            await ProductAPI.generateQRCode(response.data.id);
                        } catch (qrError) {
                            console.log('QR generation for new product failed:', qrError);
                        }
                    }
                }
                actions.resetForm();
                context.togglePageLoading(true);
                dispatch(setActivePage({ page: Pages.ARTICLE }));
            } catch (error: any) {
                console.error(error);
                Toast.error(error?.message || "Échec de l'enregistrement de l'article");
            }
        } else {
            setStep(step + 1);
        }
        actions.setSubmitting(false);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header & Stepper */}
            <Box mb={4}>
                <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, position: 'relative' }}>
                    {/* Stepper lines */}
                    <Box sx={{
                        position: 'absolute',
                        top: '24px',
                        left: '10%',
                        right: '10%',
                        height: '2px',
                        bgcolor: '#e2e8f0',
                        zIndex: 0
                    }}>
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            style={{ height: '100%', backgroundColor: '#4f46e5' }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        {steps.map((s, index) => (
                            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: index <= step ? '#4f46e5' : '#fff',
                                        borderColor: index <= step ? '#4f46e5' : '#e2e8f0',
                                        scale: index === step ? 1.1 : 1,
                                        color: index <= step ? '#fff' : '#64748b'
                                    }}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        cursor: index < step ? 'pointer' : 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff',
                                        boxShadow: index === step ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : 'none',
                                    }}
                                    onClick={() => index < step && setStep(index)}
                                >
                                    {index < step ? <TbCheck size={24} /> : s.icon}
                                </motion.div>
                                <Typography variant="caption" sx={{
                                    mt: 1.5,
                                    fontWeight: index === step ? 800 : 600,
                                    color: index <= step ? '#1e293b' : '#94a3b8',
                                    textAlign: 'center'
                                }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema[step]}
                onSubmit={handleSubmit}
            >
                {(formik: FormikProps<FormValues>) => (
                    <Form>
                        <AutoQRCodeGenerator productId={id} />
                        <Box sx={{
                            minHeight: '400px',
                            maxHeight: 'calc(100vh - 350px)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            px: { xs: 1, md: 3 },
                            pb: 3,
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' }
                        }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    {step === 0 && <ProductInfo categoryRecord={record ? record.subcategories[0]?.category : null} />}
                                    {step === 1 && <TemplateFormBridge />}
                                    {step === 2 && <SupplierInfo suppliersRecord={record ? record.suppliers : null} />}
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 4,
                            p: 2,
                            borderRadius: '20px',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(226, 232, 240, 0.8)'
                        }}>
                            <Button
                                onClick={() => setStep(step - 1)}
                                disabled={step === 0 || formik.isSubmitting}
                                startIcon={<TbChevronLeft size={20} />}
                                sx={{
                                    borderRadius: '12px',
                                    color: '#64748b',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    visibility: step === 0 ? 'hidden' : 'visible',
                                    '&:hover': { bgcolor: 'rgba(241, 245, 249, 0.8)' }
                                }}
                            >
                                Précédent
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={formik.isSubmitting || !formik.isValid}
                                    endIcon={isLastStep ? <TbCheck size={20} /> : <TbChevronRight size={20} />}
                                    sx={{
                                        borderRadius: '14px',
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                                        '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }
                                    }}
                                >
                                    {formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : isLastStep ? "Enregistrer l'article" : 'Continuer'}
                                </Button>
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default MultiStepForm;
