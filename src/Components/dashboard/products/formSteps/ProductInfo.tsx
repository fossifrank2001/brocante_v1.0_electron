import React, { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { Multiselect } from 'multiselect-react-dropdown';
import { ICategory, SubCategory } from 'Data/Interfaces/Category';
import CategoryAPI from 'Data/Api/Category';
import { IProductPayload } from 'Data/Interfaces/Product';
import { TextField, MenuItem, Select, FormControl, InputLabel, Box, Grid, Alert, AlertTitle, InputAdornment, Typography } from '@mui/material';
import { TbShoppingBag, TbBarcode, TbTag, TbBuildingFactory2, TbScan, TbBox, TbCurrencyEuro, TbCategory, TbTags, TbFileDescription, TbScale, TbReceipt, TbAlertTriangle } from 'react-icons/tb';
import UnitAPI from 'Data/Api/Unit';
import { IUnit } from 'Data/Interfaces/Unit';
import { useTranslation } from 'react-i18next';
import './ProductInfo.scss';

interface IProductInfoProps {
    categoryRecord?: ICategory | null
}

const ProductInfo: React.FC<IProductInfoProps> = ({ categoryRecord }) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<ICategory[] | null>(null);
    const [units, setUnits] = useState<IUnit[] | null>(null);
    const [category, setCategory] = useState<ICategory | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { values, handleChange, setFieldValue, touched, errors, handleBlur } = useFormikContext<IProductPayload>();

    const getInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [categoriesRes, unitsRes] = await Promise.all([
                CategoryAPI.index(),
                UnitAPI.index()
            ]);

            setCategories(categoriesRes.data.data);
            setUnits(unitsRes.data);

            if (categoryRecord) {
                const selectedCategory = categoriesRes.data.data?.find(cat => cat.id === categoryRecord?.id) || null;
                setCategory(selectedCategory);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [categoryRecord]);

    useEffect(() => {
        getInitialData();
    }, [getInitialData]);

    // Synchronisation de l'état local category avec la valeur Formik initiale
    useEffect(() => {
        if (categories && values.category && !category) {
            const selectedCategory = categories.find(cat => String(cat.id) === values.category);
            if (selectedCategory) {
                setCategory(selectedCategory);
            }
        }
    }, [categories, values.category, category]);

    return (
        <Box className="product-info-modern">
            <Box sx={{ p: 4,  }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                        <TbShoppingBag size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t('common.generalInfo')}</Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 4, borderRadius: '16px', border: '1px solid rgba(3, 169, 244, 0.2)', '& .MuiAlert-icon': { color: '#0288d1' } }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>{t('product.uniqueId')}</AlertTitle>
                    {t('product.uniqueIdDesc')}
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={t('common.name')}
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            placeholder={t('common.namePlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbTag size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={t('common.internalReference')}
                            name="internal_reference"
                            value={values.internal_reference}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.internal_reference && Boolean(errors.internal_reference)}
                            helperText={touched.internal_reference && errors.internal_reference}
                            placeholder={t('common.internalRefPlaceholder')}
                            variant="outlined"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbBarcode size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={t('common.manufacturerReference')}
                            name="manufacturer_reference"
                            value={values.manufacturer_reference}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('common.mfrRefPlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbBuildingFactory2 size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={t('common.barcode')}
                            name="barcode"
                            value={values.barcode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('common.barcodePlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbScan size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label={t('common.initialStock')}
                            name="stock_quantity"
                            type="number"
                            value={values.stock_quantity}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.stock_quantity && Boolean(errors.stock_quantity)}
                            helperText={touched.stock_quantity && errors.stock_quantity}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbBox size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label={t('common.price')}
                            name="price"
                            type="number"
                            value={values.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.price && Boolean(errors.price)}
                            helperText={touched.price && errors.price}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbCurrencyEuro size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label={t('product.costPrice')}
                            name="cost_price"
                            type="number"
                            value={values.cost_price ?? ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('product.costPricePlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbReceipt size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label={t('product.stockAlertThreshold')}
                            name="stock_alert_threshold"
                            type="number"
                            value={values.stock_alert_threshold ?? ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('product.stockAlertPlaceholder')}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbAlertTriangle size={20} color="#f59e0b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="unit-label">{t('product.uom')}</InputLabel>
                            <Select
                                labelId="unit-label"
                                label={t('product.uom')}
                                name="unit_id"
                                value={values.unit_id || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <TbScale size={20} color="#64748b" />
                                    </InputAdornment>
                                }
                                sx={{ borderRadius: '14px', bgcolor: 'var(--input-bg)' }}
                            >
                                <MenuItem value=""><em>{t('product.defaultUnit')}</em></MenuItem>
                                {units?.map(unit => (
                                    <MenuItem key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.abbreviation})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="category-label">{t('common.category')}</InputLabel>
                            <Select
                                labelId="category-label"
                                label={t('common.category')}
                                name="category"
                                value={values.category || ''}
                                onChange={(e) => {
                                    const selectedCategoryId = e.target.value;
                                    handleChange(e);
                                    const selectedCategory = categories?.find(cat => String(cat.id) === selectedCategoryId) || null;
                                    if (!selectedCategory) {
                                        setCategory(null);
                                        setFieldValue('subcategory_ids', []);
                                    } else {
                                        setCategory(selectedCategory);
                                    }
                                }}
                                disabled={isLoading}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <TbCategory size={20} color="#64748b" />
                                    </InputAdornment>
                                }
                                sx={{ borderRadius: '14px', bgcolor: 'var(--input-bg)' }}
                            >
                                <MenuItem value=""><em>{t('common.none')}</em></MenuItem>
                                {categories?.map(cat => (
                                    <MenuItem key={cat.id} value={String(cat.id)}>{cat.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid var(--border-color)', bgcolor: 'var(--bg-secondary)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <TbTags size={18} color="#4f46e5" />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('product.subCategories')}</Typography>
                            </Box>
                            <Multiselect
                                options={category?.sub_categories || []}
                                selectedValues={category ? (values.subcategory_ids || []).filter(sub => sub && typeof sub === 'object' && 'id' in sub) : []}
                                onSelect={(list: SubCategory[]) => setFieldValue('subcategory_ids', list)}
                                onRemove={(list: SubCategory[]) => setFieldValue('subcategory_ids', list)}
                                displayValue="label"
                                placeholder={category ? t('common.search') : t('common.chooseCategoryFirst')}
                                disable={!category || isLoading}
                                style={{
                                    chips: { background: '#4f46e5', borderRadius: '8px', fontWeight: 600 },
                                    searchBox: { border: 'none', background: 'transparent', padding: '0' },
                                    inputField: { color: 'var(--text-primary)' }
                                }}
                            />
                            {touched.subcategory_ids && errors.subcategory_ids && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {typeof errors.subcategory_ids === 'string' ? errors.subcategory_ids : t('product.selectionRequired')}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                {t('common.description')}
                            </Typography>
                            <Box sx={{ position: 'absolute', top: 36, left: 12, zIndex: 1 }}>
                                <TbFileDescription size={20} color="#64748b" />
                            </Box>
                            <textarea
                                name="description"
                                rows={4}
                                value={values.description}
                                onChange={handleChange}
                                placeholder={t('common.descriptionPlaceholder')}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 44px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(0, 0, 0, 0.23)',
                                    backgroundColor: 'var(--input-bg, #f8fafc)',
                                    fontFamily: 'inherit',
                                    fontSize: '0.9375rem',
                                    resize: 'vertical',
                                    minHeight: '100px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4f46e5';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.23)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};


export default ProductInfo;
