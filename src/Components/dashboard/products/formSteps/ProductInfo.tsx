import React, { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { Multiselect } from 'multiselect-react-dropdown';
import { ICategory, SubCategory } from 'Data/Interfaces/Category';
import CategoryAPI from 'Data/Api/Category';
import { IProductPayload } from 'Data/Interfaces/Product';
import { TextField, MenuItem, Select, FormControl, InputLabel, Box, Grid, Alert, AlertTitle, InputAdornment, Typography } from '@mui/material';
import { TbShoppingBag, TbBarcode, TbTag, TbBuildingFactory2, TbScan, TbBox, TbCurrencyEuro, TbCategory, TbTags, TbFileDescription, TbScale } from 'react-icons/tb';
import UnitAPI from 'Data/Api/Unit';
import { IUnit } from 'Data/Interfaces/Unit';
import './ProductInfo.scss';

interface IProductInfoProps {
    categoryRecord?: ICategory | null
}

const ProductInfo: React.FC<IProductInfoProps> = ({ categoryRecord }) => {
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

    return (
        <Box className="product-info-modern">
            <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                        <TbShoppingBag size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Informations Générales</Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 4, borderRadius: '16px', border: '1px solid rgba(3, 169, 244, 0.2)', '& .MuiAlert-icon': { color: '#0288d1' } }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>Identifiant Unique</AlertTitle>
                    La référence interne est unique et sera utilisée pour générer le <strong>QR code</strong> du produit.
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nom du Produit"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            placeholder="ex: Chaise Vintage en Cuir"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbTag size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Référence Interne (SKU)"
                            name="internal_reference"
                            value={values.internal_reference}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.internal_reference && Boolean(errors.internal_reference)}
                            helperText={touched.internal_reference && errors.internal_reference}
                            placeholder="ex: ART-2024-001"
                            variant="outlined"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbBarcode size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Référence Fabricant"
                            name="manufacturer_reference"
                            value={values.manufacturer_reference}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="ex: MFR-XYZ-123"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbBuildingFactory2 size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Code-barres (EAN/UPC)"
                            name="barcode"
                            value={values.barcode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="ex: 3760123456789"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TbScan size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Stock Initial"
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
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Prix de Vente"
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
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="unit-label">Unité de Mesure</InputLabel>
                            <Select
                                labelId="unit-label"
                                label="Unité de Mesure"
                                name="unit_id"
                                value={values.unit_id || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ mr: 1 }}>
                                        <TbScale size={20} color="#64748b" />
                                    </InputAdornment>
                                }
                                sx={{ borderRadius: '14px', bgcolor: '#fff' }}
                            >
                                <MenuItem value=""><em>Par défaut (Unitaire)</em></MenuItem>
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
                            <InputLabel id="category-label">Catégorie</InputLabel>
                            <Select
                                labelId="category-label"
                                label="Catégorie"
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
                                sx={{ borderRadius: '14px', bgcolor: '#fff' }}
                            >
                                <MenuItem value=""><em>Aucune</em></MenuItem>
                                {categories?.map(cat => (
                                    <MenuItem key={cat.id} value={String(cat.id)}>{cat.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <TbTags size={18} color="#4f46e5" />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sous-Catégories</Typography>
                            </Box>
                            <Multiselect
                                options={category?.sub_categories || []}
                                selectedValues={values.subcategory_ids}
                                onSelect={(list: SubCategory[]) => setFieldValue('subcategory_ids', list)}
                                onRemove={(list: SubCategory[]) => setFieldValue('subcategory_ids', list)}
                                displayValue="label"
                                placeholder={category ? "Rechercher..." : "Veuillez d'abord choisir une catégorie"}
                                disable={!category}
                                style={{
                                    chips: { background: '#4f46e5', borderRadius: '8px', fontWeight: 600 },
                                    searchBox: { border: 'none', background: 'transparent', padding: '0' },
                                    inputField: { color: '#1e293b' }
                                }}
                            />
                            {touched.subcategory_ids && errors.subcategory_ids && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {typeof errors.subcategory_ids === 'string' ? errors.subcategory_ids : 'Une sélection est requise'}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={values.description}
                            onChange={handleChange}
                            placeholder="Décrivez votre produit en détail..."
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                        <TbFileDescription size={20} color="#64748b" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '14px', bgcolor: '#fff' }
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ProductInfo;
