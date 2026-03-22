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
        return (_stock_quantity && _stock_quantity > 0) ? ProductAPI.STOCK : ProductAPI.OUT_OF_STOCK;
    }

    if (isLoading) {
        return (
            <Box>
                <Breadcrumd parent="Articles" url={currentPage} _child={id} />
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={60} thickness={4} sx={{ color: '#4f46e5', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    Chargement des détails de l'article...
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
                <Breadcrumd parent="Articles" url={currentPage} _child={id} />
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                            p: 2
                        }}>
                            <CardContent sx={{ p: 8, textAlign: 'center' }}>
                                <Warning sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                                    Article introuvable
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                                    L'article que vous avez demandé n'existe pas ou la requête a échoué.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                                    sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700 }}
                                >
                                    Retour à la liste
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
                <Breadcrumd parent="Articles" url={currentPage} _child={id} />

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                        <Card sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                            p: 2,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative Background */}
                            <Box sx={{
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 300,
                                height: 300,
                                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, rgba(255,255,255,0) 70%)',
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }} />

                            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                {/* Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                            color: 'white',
                                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                                        }}>
                                            <Inventory2 fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', mb: 0.5 }}>
                                                {record.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                Réf: <Box component="span" sx={{ color: '#4f46e5', bgcolor: 'rgba(79, 70, 229, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>{record.internal_reference || 'N/A'}</Box>
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ArrowBack />}
                                            onClick={() => dispatch(setActivePage({ page: Pages.ARTICLE }))}
                                            sx={{ borderRadius: '15px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { bgcolor: '#f8fafc' } }}
                                        >
                                            Retour
                                        </Button>
                                    </Box>
                                </Box>

                                <Grid container spacing={4}>
                                    {/* Primary Info & Details */}
                                    <Grid item xs={12} lg={8}>
                                        <Stack spacing={4}>
                                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                    <Inventory2 sx={{ color: '#4f46e5' }} />
                                                    Informations Principales
                                                </Typography>

                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoItem
                                                            label="Prix de vente"
                                                            value={
                                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                                    <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 800 }}>{UtilMethods.formatNumber(record.price)}</Typography>
                                                                    {record.unit?.abbreviation && record.unit.abbreviation !== 'pce' && (
                                                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>/ {record.unit.abbreviation}</Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoItem
                                                            label="Code Barre"
                                                            value={record.barcode || '-'}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                                Statut & Stock
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Chip
                                                                    label={getStatusOfProduct(record.stock_quantity)}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        fontWeight: 800,
                                                                        bgcolor: record.stock_quantity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                        color: record.stock_quantity > 0 ? '#10b981' : '#ef4444'
                                                                    }}
                                                                />
                                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#334155' }}>
                                                                    {record.stock_quantity} {record.unit?.abbreviation || 'unité(s)'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                                Sous-catégories
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {record.subcategories.map(cat => (
                                                                    <Chip
                                                                        key={cat.label}
                                                                        label={cat.label}
                                                                        size="small"
                                                                        sx={{ borderRadius: '6px', fontWeight: 600, bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}
                                                                    />
                                                                ))}
                                                                {record.subcategories.length === 0 && <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucune</Typography>}
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <InfoItem
                                                            label="Description"
                                                            value={record.description || "Aucune description fournie."}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Paper>

                                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                    <ListAlt sx={{ color: '#4f46e5' }} />
                                                    Caractéristiques Technqiues
                                                </Typography>

                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <InfoItem label="Marque" value={record.details?.brand || "-"} />
                                                        <InfoItem label="Modèle" value={record.details?.model || "-"} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <InfoItem label="Taille / Dimensions" value={record.details?.size || record.details?.dimensions || "-"} />
                                                        <InfoItem label="Poids" value={record.details?.weight || "-"} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <InfoItem label="Matière" value={record.details?.material || "-"} />
                                                        <InfoItem label="Couleur" value={record.details?.color || "-"} />
                                                    </Grid>
                                                </Grid>
                                            </Paper>

                                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                    <LocalShipping sx={{ color: '#4f46e5' }} />
                                                    Fournisseurs
                                                </Typography>

                                                <Grid container spacing={3}>
                                                    {record.suppliers.length > 0 ? record.suppliers.map((supplier, idx) => (
                                                        <Grid item xs={12} sm={6} key={idx}>
                                                            <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '12px', bgcolor: '#f8fafc' }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{supplier.name}</Typography>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>{supplier.contact_info || "Pas de contact"}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    )) : (
                                                        <Grid item xs={12}>
                                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun fournisseur associé.</Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Paper>
                                        </Stack>
                                    </Grid>

                                    {/* Right Sidebar: Image & Actions */}
                                    <Grid item xs={12} lg={4}>
                                        <Stack spacing={4}>
                                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', backgroundColor: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', textAlign: 'center' }}>
                                                {record.thumbnail ? (
                                                    <Box sx={{
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                        bgcolor: 'white',
                                                        p: 1
                                                    }}>
                                                        <Zoom>
                                                            <img
                                                                src={`${constants.URL}/${record.thumbnail.path}`}
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
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Aucune image disponible</Typography>
                                                    </Box>
                                                )}
                                            </Paper>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                                        borderRadius: '16px',
                                                        py: 1.5,
                                                        textTransform: 'none',
                                                        fontWeight: 800,
                                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                                                        '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }
                                                    }}
                                                >
                                                    Modifier cet Article
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default ReadProduct;
