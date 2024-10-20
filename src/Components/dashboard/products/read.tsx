import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Grid } from '@mui/material';
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
            <div className="container">
                <Breadcrumd parent="Articles" url={currentPage} _child={id} />
                <div className='card'>
                    <div className='card-body'>
                        <h4>Product Info</h4>
                        <span>Is loading...</span>
                    </div>
                </div>
                <div className='card mt-2'>
                    <div className='card-body'>
                        <h4>Product Details</h4>
                        <span>Is loading...</span>
                    </div>
                </div>
                <div className='card mt-2'>
                    <div className='card-body'>
                        <h4>Suppliers</h4>
                        <span>Is loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!record) {
        return <div>No product found</div>;
    }

    return (
        <div className="container">
            <Breadcrumd parent="Articles" url={currentPage} _child={id} />
            {record && (<>
                <div className='card'>
                    <div className='card-body'>
                        <h4>Product Info</h4>
                        <Grid container spacing={2}>
                            <Grid xs={12} md={12} lg={12} xl={12}>
                                <InfoItem
                                    label="Name"
                                    value={record.name}
                                    second={{
                                        label: `Price`,
                                        value: <span>{record.price} <span className='fw-bolder'
                                                                          style={{fontSize: '10px'}}> FCFA</span></span>,
                                    }}
                                />
                                <InfoItem
                                    label="Stock"
                                    value={record.stock_quantity}
                                    second={{
                                        label: `Description`,
                                        value: record.description,
                                    }}
                                />
                                <InfoItem
                                    label="Created At"
                                    value={`${dayjs(record.created_at).format('DD/MM/YYYY HH:mm:ss')}`}
                                    second={{
                                        label: `Updated At`,
                                        value: dayjs(record.updated_at).format('DD/MM/YYYY HH:mm:ss'),
                                    }}
                                />
                                <InfoItem
                                    label="Status"
                                    value={<span
                                        className={`${UtilMethods.getStatus(getStatusOfProduct(record?.stock_quantity))}`}>{getStatusOfProduct(record?.stock_quantity)}</span>}
                                    second={{
                                        label: `Sub categories`,
                                        value: record?.subcategories.map(subcategory => (
                                            <a role="alert"
                                               className="alert mb-0 py-2 badge bg-primary-subtle text-primary rounded-pill text-center">
                                                {subcategory.label}
                                            </a>
                                        ))
                                    }}
                                />

                                <div className='card-body'>
                                    <h4>Product Image</h4>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Zoom>
                                                <img
                                                    src={record.thumbnail ? `${constants.URL}/${record.thumbnail.path}` : ''}
                                                    alt={record.name}
                                                    style={{
                                                        objectFit: 'cover',
                                                        objectPosition: 'center',
                                                        cursor: 'zoom-in'
                                                    }}
                                                    width={100}
                                                    height={100}
                                                />
                                            </Zoom>
                                        </Grid>
                                    </Grid>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className='card mt-2'>
                    <div className='card-body'>
                        <h4>Product Details</h4>
                        <Grid container spacing={2}>
                            <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
                                <InfoItem
                                    label="Size"
                                    value={record?.details?.size}
                                    second={{
                                        label: `Quality class`,
                                        value: record?.details?.quality_class,
                                    }}
                                />
                                <InfoItem
                                    label="Material"
                                    value={record?.details?.material}
                                    second={{
                                        label: `Color`,
                                        value: record?.details?.color,
                                    }}
                                />
                                <InfoItem
                                    label="Brand"
                                    value={record?.details?.brand}
                                    second={{
                                        label: `Model`,
                                        value: record?.details?.model,
                                    }}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={6}>
                                <InfoItem
                                    label="Weight"
                                    value={record?.details?.weight}
                                    second={{
                                        label: `Dimensions`,
                                        value: record?.details?.dimensions,
                                    }}
                                />
                                <InfoItem
                                    label="Power"
                                    value={record?.details?.power}
                                    second={{
                                        label: `Voltage`,
                                        value: record?.details?.voltage,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </div>
                <div className='card mt-2'>
                    <div className='card-body'>
                        <h4>Suppliers</h4>
                        <Grid container spacing={2}>
                            {
                                record.suppliers.map((supply, index) => {
                                    return (
                                        <Grid item xs={12} md={6} lg={6} xl={6} className={`${index === 0 ? '__item-separator' : ''}`}>
                                            <InfoItem
                                                label="Name"
                                                value={supply?.name}
                                                second={{
                                                    label: `Contact info`,
                                                    value: supply?.contact_info,
                                                }}
                                            />
                                        </Grid>
                                    )
                                })
                            }
                            <Grid xs={12} className="d-flex align-items-center justify-content-end">
                                <button className='btn d-flex align-items-center btn-outline-dark' onClick={() => {
                                    dispatch(setActivePage({
                                        page: Pages.ARTICLE,
                                        id,
                                        param: {
                                            sub_page: 'UPDATE'
                                        }
                                    }))
                                }}>
                                    <i className='ti ti-pencil'></i>
                                    <span className='ms-1'>UPDATE</span>
                                </button>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </>)}
        </div>
    )
}

export default ReadProduct;

const getStatusOfProduct = (_stock_quantity: number): string => {
    return (_stock_quantity && _stock_quantity > 0) ? ProductAPI.STOCK : ProductAPI.OUT_OF_STOCK;
}
