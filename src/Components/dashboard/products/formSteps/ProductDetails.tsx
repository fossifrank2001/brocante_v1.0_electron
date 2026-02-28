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

const ProductDetails: React.FC = () => {
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
                            sx: { borderRadius: '14px', bgcolor: '#fff' }
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.2px' }}>
                {title}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0', ml: 1 }} />
        </Box>
    );

    return (
        <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                        <TbListCheck size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Spécifications Techniques</Typography>
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
                    {showAll ? 'Moins de détails' : 'Plus de détails'}
                </Button>
            </Box>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Brand & Model */}
                    <SectionHeader title="Identification" icon={<TbBuildingStore size={20} />} />
                    <Grid container spacing={3}>
                        {renderField("Marque", "product_details.brand", <TbBuildingStore size={20} />, "Marque du produit")}
                        {renderField("Modèle", "product_details.model", <TbTag size={20} />, "Nom ou numéro du modèle")}
                        {renderField("Classe de Qualité", "product_details.quality_class", <TbStar size={20} />, "Classification de qualité")}
                    </Grid>

                    {/* Dimensions */}
                    <SectionHeader title="Dimensions & Mesures" icon={<TbRuler2 size={20} />} />
                    <Grid container spacing={3}>
                        {renderField("Dimensions", "product_details.dimensions", <TbRuler2 size={20} />, "Dimensions globales (L x l x H)")}
                        {renderField("Poids", "product_details.weight", <TbWeight size={20} />, "Poids du produit")}
                        {renderField("Taille", "product_details.size", <TbRuler2 size={20} />, "Taille standard")}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField("Longueur", "product_details.length", <TbRuler2 size={20} />, "Longueur")}
                                    {renderField("Largeur", "product_details.width", <TbRuler2 size={20} />, "Largeur")}
                                    {renderField("Hauteur", "product_details.height", <TbRuler2 size={20} />, "Hauteur")}
                                    {renderField("Épaisseur", "product_details.thickness", <TbRuler2 size={20} />, "Épaisseur")}
                                    {renderField("Diamètre", "product_details.diameter", <TbCircle size={20} />, "Diamètre")}
                                    {renderField("Calibre (Gauge)", "product_details.gauge", <TbRuler2 size={20} />, "Calibre")}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Aesthetics */}
                    <SectionHeader title="Esthétique & Matériaux" icon={<TbPalette size={20} />} />
                    <Grid container spacing={3}>
                        {renderField("Couleur", "product_details.color", <TbPalette size={20} />, "Couleur dominante")}
                        {renderField("Matériau", "product_details.material", <TbBox size={20} />, "Matériau principal")}
                        {renderField("Finition", "product_details.finish", <TbBrush size={20} />, "Finition de surface")}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField("Forme", "product_details.shape", <TbShape size={20} />, "Forme du produit")}
                                    {renderField("Motif", "product_details.pattern", <TbArtboard size={20} />, "Motif ou design")}
                                    {renderField("Texture", "product_details.texture", <TbGrain size={20} />, "Texture de surface")}
                                    {renderField("Style", "product_details.style", <TbBrush size={20} />, "Style de design")}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Technical */}
                    <SectionHeader title="Technique & Électrique" icon={<TbBolt size={20} />} />
                    <Grid container spacing={3}>
                        {renderField("Puissance", "product_details.power", <TbBolt size={20} />, "Puissance nominale")}
                        {renderField("Tension (Voltage)", "product_details.voltage", <TbBolt size={20} />, "Tension de fonctionnement")}
                        {renderField("Capacité", "product_details.capacity", <TbBox size={20} />, "Capacité totale")}

                        <Grid item xs={12}>
                            <Collapse in={showAll}>
                                <Grid container spacing={3}>
                                    {renderField("Tension Nominale", "product_details.voltage_rating", <TbBolt size={20} />, "Classe de tension")}
                                    {renderField("Intensité Nominale", "product_details.current_rating", <TbBolt size={20} />, "Courant max")}
                                    {renderField("Capacité (Volume)", "product_details.capacity_volume", <TbBox size={20} />, "Volume")}
                                    {renderField("Capacité (Poids)", "product_details.capacity_weight", <TbWeight size={20} />, "Charge max")}
                                    {renderField("Débit (Flow Rate)", "product_details.flow_rate", <TbArrowsRightLeft size={20} />, "Débit")}
                                    {renderField("Pression", "product_details.pressure", <TbGauge size={20} />, "Pression nominale")}
                                    {renderField("Température", "product_details.temperature", <TbTemperature size={20} />, "Température max/min")}
                                </Grid>
                            </Collapse>
                        </Grid>
                    </Grid>

                    {/* Usage & Support */}
                    <SectionHeader title="Usage & Support" icon={<TbShieldCheck size={20} />} />
                    <Grid container spacing={3}>
                        {renderField("Garantie", "product_details.warranty", <TbShieldCheck size={20} />, "Informations de garantie")}
                        {renderField("Usage", "product_details.usage", <TbTool size={20} />, "Usage recommandé")}
                        {renderField("Compatibilité", "product_details.compatibility", <TbPuzzle size={20} />, "Appareils/systèmes compatibles")}

                        {renderField("Caractéristiques", "product_details.features", <TbListCheck size={20} />, "Points clés", "text", true)}
                        {renderField("Notes", "product_details.notes", <TbNote size={20} />, "Notes additionnelles", "text", true)}
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
                                Afficher tous les champs techniques
                            </Button>
                        </Box>
                    )}
                </motion.div>
            </AnimatePresence>
        </Box>
    );
};

export default ProductDetails;
