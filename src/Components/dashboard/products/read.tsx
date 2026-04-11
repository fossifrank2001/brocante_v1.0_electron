import Breadcrumd from '@/Components/Breadcrumd';
import InfoItem from '@/Components/InfoItem';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Grid, CircularProgress, Card, CardContent, Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { setActivePage } from '@/Data/Slices/NavigationSlice';
import { Pages } from '@/Data/Objects/state';
import ProductAPI from "Data/Api/Product";
import { IProduct } from "Data/Interfaces/Supply";
import UtilMethods from "Data/Utilities/UtilMethods";
import constants from "Data/Utilities/constants";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { motion } from 'framer-motion';
import { ArrowBack, Edit, Inventory2, ListAlt, LocalShipping, ImageNotSupported, Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ReadProduct = () => {
    const { t } = useTranslation();
    const { currentPage, id } = useAppSelector((state) => state.navigaton);
    const [record, setRecord] = useState<IProduct | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    const getRecord = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await ProductAPI.show(id);
            setRecord(data);
        } catch (e: any) {
            console.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getRecord();
    }, [getRecord]);

    const getStatusOfProduct = (_stock_quantity: number): string => {
        return (_stock_quantity && _stock_quantity > 0) ? t('product.inStock') : t('product.outOfStock');
    }

    if (isLoading) {
        return (
            <Box>
                <Breadcrumd parent={t('menu.ARTICLE')} url={currentPage} _child={id} />
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={60} thickness={4} sx={{ color: '#4f46e5', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    {t('product.loadingDetails')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!record) {
        return (
            <Box>
                <Breadcrumd parent={t('menu.ARTICLE')} url={currentPage} _child={id} />
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: 'var(--shadow-lg)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 8, textAlign: 'center' }}>
                                <Warning sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
                                    {t('product.notFound')}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                                    {t('product.notFoundDesc')}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                                    sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700 }}
                                >
                                    {t('product.returnToList')}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Breadcrumd parent={t('menu.ARTICLE')} url={currentPage} _child={id} />

                {/* Header Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                        >
                            {t('product.back')}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => {
                                dispatch(setActivePage({
                                    page: Pages.ARTICLE,
                                    id,
                                    param: { sub_page: 'UPDATE' }
                                }))
                            }}
                            sx={{
                                borderRadius: '15px',
                                textTransform: 'none',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            {t('product.editProduct')}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column: Info Cards */}
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={3}>
                            {/* Product Info Card */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                <Inventory2 />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>{record.name}</Typography>
                                        </Box>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('common.reference')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>{record.internal_reference || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.barcode')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#6366f1' }}>{record.barcode || '-'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.sellingPrice')}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>{UtilMethods.formatAmount(record.price)}</Typography>
                                                    {record.unit?.abbreviation && record.unit.abbreviation !== 'pce' && (
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>/ {record.unit.abbreviation}</Typography>
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('common.status')}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Chip
                                                        label={getStatusOfProduct(record.stock_quantity)}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '6px',
                                                            fontWeight: 800,
                                                            bgcolor: record.stock_quantity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: record.stock_quantity > 0 ? '#10b981' : '#ef4444'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                        {record.stock_quantity} {record.unit?.abbreviation || 'unité(s)'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('common.description')}</Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                                                    {record.description || t('product.noDescription')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 1 }}>{t('product.subCategories')}</Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {record.subcategories.map(cat => (
                                                        <Chip
                                                            key={cat.label}
                                                            label={cat.label}
                                                            size="small"
                                                            sx={{ borderRadius: '6px', fontWeight: 600, bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}
                                                        />
                                                    ))}
                                                    {record.subcategories.length === 0 && <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('common.none')}</Typography>}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Template-based attributes */}
                            {(record as any).template && (record as any).template_values && Object.keys((record as any).template_values).length > 0 && (
                                <Grid item xs={12}>
                                    <Card sx={{
                                        borderRadius: '24px',
                                        border: '1px solid rgba(79, 70, 229, 0.2)',
                                        background: 'var(--bg-surface)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                                                    <ListAlt />
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>{(record as any).template.name}</Typography>
                                            </Box>
                                            <Grid container spacing={3}>
                                                {((record as any).template.fields || []).map((field: any) => {
                                                    const val = (record as any).template_values[field.field_key];
                                                    if (val === undefined || val === null || val === '') return null;
                                                    let displayVal = String(val);
                                                    if (field.field_type === 'boolean') displayVal = val === true || val === 'true' ? t('common.yes') : t('common.no');
                                                    if (field.unit) displayVal = `${val} ${field.unit}`;
                                                    return (
                                                        <Grid item xs={12} sm={6} key={field.id || field.field_key}>
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{field.name}</Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{displayVal}</Typography>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Technical Specs */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                <ListAlt />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>{t('product.technicalSpecs')}</Typography>
                                        </Box>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.brand')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.brand || "-"}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.model')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.model || "-"}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.dimensions')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.size || record.details?.dimensions || "-"}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.weight')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.weight || "-"}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.material')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.material || "-"}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{t('product.color')}</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{record.details?.color || "-"}</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Suppliers */}
                            <Grid item xs={12}>
                                <Card sx={{
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                                <LocalShipping />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>{t('navigation.suppliers')}</Typography>
                                        </Box>
                                        {record.suppliers.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {record.suppliers.map((supplier, idx) => (
                                                    <Grid item xs={12} sm={6} key={idx}>
                                                        <Box sx={{ p: 2, border: '1px solid var(--border-color)', borderRadius: '12px', bgcolor: 'var(--bg-secondary)' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{supplier.name}</Typography>
                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>{supplier.contact_info || t('product.noContact')}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{t('product.noSupplier')}</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Column: Image & QR Codes */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            boxShadow: 'var(--shadow-sm)',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                    <ImageNotSupported />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{t('product.visualIdentity')}</Typography>
                            </Box>
                            <CardContent sx={{ p: 0 }}>
                                {/* Product Image */}
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    {record.thumbnail ? (
                                        <Box sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            bgcolor: 'var(--input-bg)',
                                            p: 1
                                        }}>
                                            <Zoom>
                                                <img
                                                    src={
                                                        record.thumbnail.path.startsWith('http://') || record.thumbnail.path.startsWith('https://')
                                                            ? record.thumbnail.path
                                                            : `${constants.URL}/${record.thumbnail.path}`
                                                    }
                                                    alt={record.name}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        maxHeight: '300px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </Zoom>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            py: 8,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#94a3b8',
                                            bgcolor: 'rgba(255,255,255,0.5)',
                                            borderRadius: '16px',
                                            border: '2px dashed #e2e8f0'
                                        }}>
                                            <ImageNotSupported sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('product.noImage')}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Barcode */}
                                {record.barcode && (
                                    <Box sx={{ p: 3, bgcolor: 'rgba(99, 102, 241, 0.03)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 2, textAlign: 'center' }}>
                                            {t('product.barcode')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                            <img
                                                src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(record.barcode)}&code=Code128&translate-esc=on`}
                                                alt={`Barcode ${record.barcode}`}
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace', display: 'block', textAlign: 'center' }}>
                                            {record.barcode}
                                        </Typography>
                                    </Box>
                                )}

                                {/* QR Code */}
                                <Box sx={{ p: 3, bgcolor: 'rgba(16, 185, 129, 0.03)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 2, textAlign: 'center' }}>
                                        {t('product.qrCodeTitle')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`PRODUCT:${record.id}`)}`}
                                            alt={`QR Code ${record.id}`}
                                            style={{ width: 150, height: 150 }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default ReadProduct;
