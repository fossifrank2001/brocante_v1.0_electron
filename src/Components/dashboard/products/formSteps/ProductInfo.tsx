import React, { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { Multiselect } from 'multiselect-react-dropdown';
import { ICategory, SubCategory } from 'Data/Interfaces/Category';
import CategoryAPI from 'Data/Api/Category';
import { IProductPayload } from 'Interfaces';
import { motion } from 'framer-motion';
import { Tooltip } from '@mui/material';
import './ProductInfo.scss';

interface IProductInfoProps{
    categoryRecord?: ICategory | null
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const ProductInfo: React.FC<IProductInfoProps> = ({categoryRecord}) => {
    const [categories, setCategories] = useState<ICategory[] | null>(null);
    const [category, setCategory] = useState<ICategory | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { values, handleChange, setFieldValue, touched, errors } = useFormikContext<IProductPayload>();

    const getCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: _categories } = await CategoryAPI.index();
            setCategories(_categories.data);

            if (categoryRecord){
                const selectedCategory = _categories.data?.find(category => category.id === categoryRecord?.id) || null;
                setCategory(selectedCategory);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [categoryRecord]);

    useEffect(() => {
        getCategories();
    }, [getCategories, categoryRecord]);

    return (
        <motion.div 
            className="product-info"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="info-card">
                <h6 className="card-title">
                    <i className="ti ti-shopping-cart"></i>
                    Basic Product Information
                </h6>
                <div className="row g-4">
                    <div className="col-12">
                        <div className="alert alert-info d-flex align-items-center" style={{ borderRadius: '8px' }}>
                            <i className="ti ti-info-circle me-2"></i>
                            <small>La référence interne est unique et sera utilisée pour générer le QR code du produit</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="name">
                                <i className="ti ti-tag"></i>
                                Product Name
                            </label>
                            <Tooltip title="Enter the name of your product" arrow placement="top">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.name}
                                    placeholder="e.g., Vintage Leather Chair"
                                />
                            </Tooltip>
                            {touched.name && errors.name && (
                                <div className="error-feedback">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="internal_reference">
                                <i className="ti ti-barcode"></i>
                                Référence Interne (SKU)
                                <span className="text-danger ms-1">*</span>
                            </label>
                            <Tooltip title="Référence unique pour identifier le produit" arrow placement="top">
                                <input
                                    id="internal_reference"
                                    name="internal_reference"
                                    type="text"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.internal_reference || ''}
                                    placeholder="ex: PROD-2024-001"
                                />
                            </Tooltip>
                            {touched.internal_reference && errors.internal_reference && (
                                <div className="error-feedback">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{errors.internal_reference}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="manufacturer_reference">
                                <i className="ti ti-building-factory"></i>
                                Référence Fabricant
                            </label>
                            <Tooltip title="Référence du fabricant (optionnel)" arrow placement="top">
                                <input
                                    id="manufacturer_reference"
                                    name="manufacturer_reference"
                                    type="text"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.manufacturer_reference || ''}
                                    placeholder="ex: MFR-XYZ-123"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="barcode">
                                <i className="ti ti-scan"></i>
                                Code-barres (EAN/UPC)
                            </label>
                            <Tooltip title="Code-barres du produit si disponible" arrow placement="top">
                                <input
                                    id="barcode"
                                    name="barcode"
                                    type="text"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.barcode || ''}
                                    placeholder="ex: 3760123456789"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <div className="form-group">
                            <label htmlFor="stock_quantity">
                                <i className="ti ti-box"></i>
                                Stock
                            </label>
                            <Tooltip title="Enter available quantity" arrow placement="top">
                                <input
                                    id="stock_quantity"
                                    name="stock_quantity"
                                    type="number"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.stock_quantity}
                                    placeholder="0"
                                    min="0"
                                />
                            </Tooltip>
                            {touched.stock_quantity && errors.stock_quantity && (
                                <div className="error-feedback">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{errors.stock_quantity}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-2">
                        <div className="form-group">
                            <label htmlFor="price">
                                <i className="ti ti-currency-euro"></i>
                                Price
                            </label>
                            <Tooltip title="Enter product price" arrow placement="top">
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.price}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </Tooltip>
                            {touched.price && errors.price && (
                                <div className="error-feedback">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>{errors.price}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="category">
                                <i className="ti ti-category"></i>
                                Category
                            </label>
                            <Tooltip title="Select product category" arrow placement="top">
                                <select
                                    className="form-select"
                                    disabled={isLoading}
                                    id="category"
                                    name="category"
                                    value={values.category || ''}
                                    onChange={(e) => {
                                        const selectedCategoryId = e.target.value;
                                        handleChange(e);
                                        const selectedCategory = categories?.find(category => String(category.id) === selectedCategoryId) || null;

                                        if (selectedCategory === null || selectedCategoryId === '') {
                                            setCategory(null);
                                            setFieldValue('subcategory_ids', []);
                                        } else {
                                            setCategory(selectedCategory);
                                        }
                                    }}
                                >
                                    <option value="" label="Select a Category" />
                                    {categories?.map(_category => (
                                        <option key={_category.id} value={_category.id.toString()} label={_category.label} />
                                    ))}
                                </select>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="form-group">
                            <label htmlFor="subcategory_ids">
                                <i className="ti ti-tags"></i>
                                Sub Categories
                            </label>
                            <Tooltip title="Select relevant sub-categories" arrow placement="top">
                                <div>
                                    <Multiselect
                                        options={category?.sub_categories || []}
                                        selectedValues={values.subcategory_ids}
                                        onSelect={(selectedList: SubCategory[]) => setFieldValue('subcategory_ids', selectedList)}
                                        onRemove={(selectedList: SubCategory[]) => setFieldValue('subcategory_ids', selectedList)}
                                        displayValue="label"
                                        placeholder="Select sub-categories"
                                        disable={!category}
                                        style={{
                                            chips: { background: '#4318FF' },
                                            searchBox: { 
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '8px'
                                            }
                                        }}
                                    />
                                </div>
                            </Tooltip>
                            {touched.subcategory_ids && errors.subcategory_ids && (
                                <div className="error-feedback">
                                    <i className="ti ti-alert-circle"></i>
                                    <span>
                                        {Array.isArray(errors.subcategory_ids)
                                            ? errors.subcategory_ids.map(error => error.label || 'Error').join(', ')
                                            : errors.subcategory_ids}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="form-group mb-0">
                            <label htmlFor="description">
                                <i className="ti ti-file-description"></i>
                                Description
                            </label>
                            <Tooltip title="Describe your product" arrow placement="top">
                                <textarea
                                    id="description"
                                    name="description"
                                    className="form-control"
                                    onChange={handleChange}
                                    value={values.description}
                                    placeholder="Enter a detailed description of your product..."
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductInfo;
