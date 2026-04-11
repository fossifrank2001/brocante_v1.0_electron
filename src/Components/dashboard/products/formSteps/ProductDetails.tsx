import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { IProductPayload } from 'Data/Interfaces/Product';
import { Box, Grid, TextField, Typography, InputAdornment, Tooltip, Collapse, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TbBuildingStore, TbTag, TbRuler2, TbCircle, TbWeight, TbPalette,
    TbBrush, TbShape, TbArtboard, TbGrain, TbBolt, TbGauge,
    TbTemperature, TbArrowsRightLeft, TbBox, TbStar, TbTool,
    TbPuzzle, TbShieldCheck, TbNote, TbListCheck,
    TbChevronDown, TbChevronUp
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

const ProductDetails: React.FC = () => {
    const { t } = useTranslation();
    const { values, handleChange, touched, errors, handleBlur } = useFormikContext<IProductPayload>();
    const [showAll, setShowAll] = useState(false);

    const renderField = (
        label: string,
        fieldName: string,
        icon: React.ReactNode,
        tooltip: string,
        type: string = "text",
        multiline: boolean = false
    ) => {
        const key = fieldName.split('.')[2];
        const error = touched.product_details?.[key] && Boolean(errors.product_details?.[key]);
        const helperText = touched.product_details?.[key] && (errors.product_details?.[key] as string);

        return (
            <Grid item xs={12} md={6} lg={4}>
                <Tooltip title={tooltip} arrow placement="top">
                    <TextField
                        fullWidth
                        label={label}
                        name={fieldName}
                        type={type}
                        multiline={multiline}
                        rows={multiline ? 4 : 1}
                        value={values.product_details[key] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={error}
                        helperText={helperText}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ color: '#64748b', display: 'flex' }}>{icon}</Box>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '14px', bgcolor: 'var(--input-bg)' }
                        }}
                    />
                </Tooltip>
            </Grid>
        );
    };

    const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 4 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', display: 'flex' }}>
                {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {title}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'var(--border-color)', ml: 1 }} />
        </Box>
    );

    return (
        <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                        <TbListCheck size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t('product.technicalSpecs')}</Typography>
                </Box>
                <Button
                    onClick={() => setShowAll(!showAll)}
                    startIcon={showAll ? <TbChevronUp /> : <TbChevronDown />}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: '#4f46e5',
                        '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.05)' }
                    }}
                >
                    {showAll ? t('product.showLessSpecs') : t('product.showMoreDetails')}
                </Button>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Brand & Model */}
                    <SectionHeader title={t('product.identification')} icon={<TbBuildingStore size={20} />} />
                    <Grid container spacing={3}>
                        {renderField(t('product.brand'), "product_details.brand", <TbBuildingStore size={20} />, t('product.brand'))}
                        {renderField(t('product.model'), "product_details.model", <TbTag size={20} />, t('product.model'))}
                        {renderField(t('product.qualityClass'), "product_details.quality_class", <TbStar size={20} />, t('product.qualityClass'))}
                    </Grid>

                    {/* Dimensions */}
                    <SectionHeader title={t('product.dimensionsMeasures')} icon={<TbRuler2 size={20} />} />
                    <Grid container spacing={3}>
                        {renderField(t('product.dimensions'), "product_details.dimensions", <TbRuler2 size={20} />, t('product.dimensions'))}
                        {renderField(t('product.weight'), "product_details.weight", <TbWeight size={20} />, t('product.weight'))}
                        {renderField(t('product.size'), "product_details.size", <TbRuler2 size={20} />, t('product.size'))}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField(t('product.length'), "product_details.length", <TbRuler2 size={20} />, t('product.length'))}
                                    {renderField(t('product.width'), "product_details.width", <TbRuler2 size={20} />, t('product.width'))}
                                    {renderField(t('product.height'), "product_details.height", <TbRuler2 size={20} />, t('product.height'))}
                                    {renderField(t('product.thickness'), "product_details.thickness", <TbRuler2 size={20} />, t('product.thickness'))}
                                    {renderField(t('product.diameter'), "product_details.diameter", <TbCircle size={20} />, t('product.diameter'))}
                                    {renderField(t('product.gauge'), "product_details.gauge", <TbRuler2 size={20} />, t('product.gauge'))}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Aesthetics */}
                    <SectionHeader title={t('product.aestheticsMaterials')} icon={<TbPalette size={20} />} />
                    <Grid container spacing={3}>
                        {renderField(t('product.color'), "product_details.color", <TbPalette size={20} />, t('product.color'))}
                        {renderField(t('product.material'), "product_details.material", <TbBox size={20} />, t('product.material'))}
                        {renderField(t('product.finish'), "product_details.finish", <TbBrush size={20} />, t('product.finish'))}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField(t('product.shape'), "product_details.shape", <TbShape size={20} />, t('product.shape'))}
                                    {renderField(t('product.pattern'), "product_details.pattern", <TbArtboard size={20} />, t('product.pattern'))}
                                    {renderField(t('product.texture'), "product_details.texture", <TbGrain size={20} />, t('product.texture'))}
                                    {renderField(t('product.style'), "product_details.style", <TbBrush size={20} />, t('product.style'))}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Technical */}
                    <SectionHeader title={t('product.technicalElectrical')} icon={<TbBolt size={20} />} />
                    <Grid container spacing={3}>
                        {renderField(t('product.power'), "product_details.power", <TbBolt size={20} />, t('product.power'))}
                        {renderField(t('product.voltage'), "product_details.voltage", <TbBolt size={20} />, t('product.voltage'))}
                        {renderField(t('product.capacity'), "product_details.capacity", <TbBox size={20} />, t('product.capacity'))}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField(t('product.voltageRating'), "product_details.voltage_rating", <TbBolt size={20} />, t('product.voltageRating'))}
                                    {renderField(t('product.currentRating'), "product_details.current_rating", <TbBolt size={20} />, t('product.currentRating'))}
                                    {renderField(t('product.capacityVolume'), "product_details.capacity_volume", <TbBox size={20} />, t('product.capacityVolume'))}
                                    {renderField(t('product.capacityWeight'), "product_details.capacity_weight", <TbWeight size={20} />, t('product.capacityWeight'))}
                                    {renderField(t('product.flowRate'), "product_details.flow_rate", <TbArrowsRightLeft size={20} />, t('product.flowRate'))}
                                    {renderField(t('product.pressure'), "product_details.pressure", <TbGauge size={20} />, t('product.pressure'))}
                                    {renderField(t('product.temperature'), "product_details.temperature", <TbTemperature size={20} />, t('product.temperature'))}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Usage & Support */}
                    <SectionHeader title={t('product.usageSupport')} icon={<TbShieldCheck size={20} />} />
                    <Grid container spacing={3}>
                        {renderField(t('product.warranty'), "product_details.warranty", <TbShieldCheck size={20} />, t('product.warranty'))}
                        {renderField(t('product.usage'), "product_details.usage", <TbTool size={20} />, t('product.usage'))}
                        {renderField(t('product.compatibility'), "product_details.compatibility", <TbPuzzle size={20} />, t('product.compatibility'))}

                        {renderField(t('product.features'), "product_details.features", <TbListCheck size={20} />, t('product.features'), "text", true)}
                        {renderField(t('product.notes'), "product_details.notes", <TbNote size={20} />, t('product.notes'), "text", true)}
                    </Grid>

                    {!showAll && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                onClick={() => setShowAll(true)}
                                variant="outlined"
                                startIcon={<TbChevronDown />}
                                sx={{
                                    borderRadius: '12px',
                                    px: 4,
                                    py: 1,
                                    borderStyle: 'dashed',
                                    fontWeight: 700,
                                    color: '#64748b',
                                    borderColor: '#cbd5e1',
                                    '&:hover': { borderColor: '#4f46e5', color: '#4f46e5', bgcolor: 'transparent' }
                                }}
                            >
                                {t('product.showMoreSpecs')}
                            </Button>
                        </Box>
                    )}
                </motion.div>
            </AnimatePresence>
        </Box>
    );
};

export default ProductDetails;
