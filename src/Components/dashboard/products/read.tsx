import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Grid, Skeleton, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import ProductAPI from "Data/Api/Product.ts";
import { IProduct } from "Data/Interfaces/Supply.ts";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import constants from "Data/Utilities/constants.ts";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import '@/Styles/products.scss';
import { motion } from 'framer-motion';

const ReadProduct = () => {
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IProduct | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    const getRecord = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await ProductAPI.show(id);
            setRecord(data);
        } catch (e) {
            console.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getRecord();
    }, [getRecord]);

    if (isLoading) {
        return (
            <div className="container product-detail">
                <Breadcrumd parent="Articles" url={currentPage} _child={id} />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="card-body">
                        <h4><i className="ti ti-box"></i>Product Info</h4>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Skeleton variant="rectangular" height={60} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton variant="rectangular" height={100} />
                            </Grid>
                        </Grid>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="container product-detail">
                <div className="text-center py-5">
                    <i className="ti ti-alert-circle text-warning" style={{ fontSize: '3rem' }}></i>
                    <h3 className="mt-3">No product found</h3>
                    <p className="text-muted">The requested product could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container product-detail">
            <Breadcrumd parent="Articles" url={currentPage} _child={id} />
            {record && (
                <>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <div className="card-body">
                            <h4><i className="ti ti-box"></i>Product Info</h4>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <InfoItem
                                        label="Name"
                                        value={record.name}
                                        second={{
                                            label: "Price",
                                            value: <span className="fw-bold">{record.price} <small>FCFA</small></span>
                                        }}
                                    />
                                    <InfoItem
                                        label="Stock"
                                        value={record.stock_quantity}
                                        second={{
                                            label: "Description",
                                            value: record.description || "No description available"
                                        }}
                                    />
                                    <InfoItem
                                        label="Status"
                                        value={
                                            <span className={`status-badge ${record.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {getStatusOfProduct(record.stock_quantity)}
                                            </span>
                                        }
                                        second={{
                                            label: "Sub categories",
                                            value: (
                                                <div className="mt-2">
                                                    {record.subcategories.map(subcategory => (
                                                        <span key={subcategory.label} className="subcategory-tag">
                                                            {subcategory.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <div className="product-image">
                                        <Zoom>
                                            <img
                                                src={record.thumbnail ? `${constants.URL}/${record.thumbnail.path}` : '/placeholder.png'}
                                                alt={record.name}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </Zoom>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                    >
                        <div className="card-body">
                            <h4><i className="ti ti-list-details"></i>Product Details</h4>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} className="__item-separator">
                                    <InfoItem
                                        label="Size"
                                        value={record.details?.size || "N/A"}
                                        second={{
                                            label: "Quality class",
                                            value: record.details?.quality_class || "N/A"
                                        }}
                                    />
                                    <InfoItem
                                        label="Material"
                                        value={record.details?.material || "N/A"}
                                        second={{
                                            label: "Color",
                                            value: record.details?.color || "N/A"
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InfoItem
                                        label="Brand"
                                        value={record.details?.brand || "N/A"}
                                        second={{
                                            label: "Model",
                                            value: record.details?.model || "N/A"
                                        }}
                                    />
                                    <InfoItem
                                        label="Weight"
                                        value={record.details?.weight || "N/A"}
                                        second={{
                                            label: "Dimensions",
                                            value: record.details?.dimensions || "N/A"
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="card-body">
                            <h4><i className="ti ti-truck-delivery"></i>Suppliers</h4>
                            <Grid container spacing={3}>
                                {record.suppliers.map((supply, index) => (
                                    <Grid item key={index} xs={12} md={6}>
                                        <div className="supplier-card">
                                            <InfoItem
                                                label="Name"
                                                value={supply.name}
                                                second={{
                                                    label: "Contact info",
                                                    value: supply.contact_info || "No contact information"
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                ))}
                            </Grid>
                            <div className="text-end mt-4">
                                <button
                                    className="update-button"
                                    onClick={() => {
                                        dispatch(setActivePage({
                                            page: Pages.ARTICLE,
                                            id,
                                            param: {
                                                sub_page: 'UPDATE'
                                            }
                                        }))
                                    }}
                                >
                                    <i className="ti ti-pencil"></i>
                                    Update Product
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default ReadProduct;

const getStatusOfProduct = (_stock_quantity: number): string => {
    return (_stock_quantity && _stock_quantity > 0) ? ProductAPI.STOCK : ProductAPI.OUT_OF_STOCK;
}
