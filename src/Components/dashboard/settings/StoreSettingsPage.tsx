import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    CircularProgress,
    Avatar,
    Tabs,
    Tab,
    InputAdornment,
    Paper,
    useTheme,
} from '@mui/material';
import {
    Save as SaveIcon,
    Store as StoreIcon,
    Settings as SettingsIcon,
    CloudUpload as UploadIcon,
    Inventory as InventoryIcon,
    Language as LanguageIcon,
    Payments as PaymentsIcon,
    Description as DescriptionIcon,
    LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import StoreSettingAPI from '@/Data/Api/StoreSetting';
import { IStoreSetting, IStoreSettingPayload } from '@/Data/Interfaces/StoreSetting';
import Toast from '@/Data/Utilities/Toast';
import constants from '@/Data/Utilities/constants';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <AnimatePresence mode="wait">
            {value === index && (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    role="tabpanel"
                >
                    <Box sx={{ pt: 3 }}>{children}</Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StoreSettingsPage: React.FC = () => {
    const theme = useTheme();
    const [settings, setSettings] = useState<IStoreSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState(0);
    const [form, setForm] = useState<IStoreSettingPayload>({});
    const [hasChanges, setHasChanges] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await StoreSettingAPI.show();
            setSettings(response.data);
            setForm(response.data);
            setHasChanges(false);
        } catch (e) {
            console.error('Error fetching store settings:', e);
            Toast.error('Impossible de charger les paramètres');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (field: keyof IStoreSettingPayload, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await StoreSettingAPI.update(form);
            setSettings(response.data);
            setForm(response.data);
            setHasChanges(false);
            Toast.success('Paramètres enregistrés avec succès');
        } catch (e: any) {
            Toast.error(e?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' = 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const response = type === 'logo' 
                ? await StoreSettingAPI.uploadLogo(file)
                : await StoreSettingAPI.uploadSignature(file);
            
            setSettings(response.data);
            if (type === 'logo') {
                setForm(prev => ({ ...prev, logo_path: response.data.logo_path }));
                Toast.success('Logo mis à jour');
            } else {
                setForm(prev => ({ ...prev, signature_path: response.data.signature_path }));
                Toast.success('Signature mise à jour');
            }
        } catch (err: any) {
            Toast.error(err?.message || `Erreur lors de l’upload du ${type}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
                <CircularProgress thickness={5} size={60} sx={{ color: theme.palette.primary.main }} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4}>
                    <Box>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box 
                                sx={{ 
                                    p: 1, 
                                    borderRadius: '12px', 
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <SettingsIcon sx={{ color: '#fff', fontSize: 24 }} />
                            </Box>
                            <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                                Configuration
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            Gérez l'identité de votre magasin et personnalisez vos documents fiscaux.
                        </Typography>
                    </Box>
                    
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        sx={{ 
                            borderRadius: '12px', 
                            px: 4, 
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                            }
                        }}
                    >
                        {saving ? 'Sauvegarde...' : 'Enregistrer'}
                    </Button>
                </Box>
            </motion.div>

            {hasChanges && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Alert 
                        severity="info" 
                        variant="outlined"
                        sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}
                    >
                        Vous avez des modifications non enregistrées.
                    </Alert>
                </motion.div>
            )}

            {/* Main Configuration Card */}
            <Paper 
                elevation={0}
                sx={{ 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, md: 3 }, pt: 2, bgcolor: '#f9fafb' }}>
                    <Tabs 
                        value={tab} 
                        onChange={(_, v) => setTab(v)} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 64,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <Tab icon={<StoreIcon />} iconPosition="start" label="Identité Store" />
                        <Tab icon={<InventoryIcon />} iconPosition="start" label="Gestion Stock & POS" />
                        <Tab icon={<LanguageIcon />} iconPosition="start" label="Régionalisation" />
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {/* ── SECTION 0: IDENTITÉ ── */}
                    <TabPanel value={tab} index={0}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Logo & Image de Marque</Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Ce logo apparaîtra sur toutes vos factures, reçus et l'interface client.
                                </Typography>
                                
                                <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: '20px' }}>
                                    <Avatar
                                        key={settings?.logo_path}
                                        src={settings?.logo_path ? `${constants.URL}/storage/${settings.logo_path}` : undefined}
                                        sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            mx: 'auto',
                                            mb: 2,
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                            bgcolor: 'primary.light'
                                        }}
                                    >
                                        {!settings?.logo_path && <StoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
                                    </Avatar>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        size="medium"
                                        startIcon={<UploadIcon />}
                                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                                    >
                                        Télécharger Logo
                                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                    </Button>

                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 4, mb: 1.5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" color="primary" /> Signature / Cachet
                                    </Typography>
                                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: '#fcfcfc', mb: 2 }}>
                                        <Avatar
                                            key={settings?.signature_path}
                                            variant="square"
                                            src={settings?.signature_path ? `${constants.URL}/storage/${settings.signature_path}` : undefined}
                                            sx={{ 
                                                width: '100%', 
                                                height: 80, 
                                                mb: 2,
                                                borderRadius: '8px',
                                                bgcolor: 'background.paper',
                                                border: '1px solid #eee',
                                                '& img': { objectFit: 'contain' }
                                            }}
                                        >
                                            {!settings?.signature_path && <Typography variant="caption" color="text.secondary">Aucune signature</Typography>}
                                        </Avatar>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<UploadIcon />}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            Changer Signature
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'signature')} />
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                        PNG ou JPG conseillé. Max 2Mb.
                                    </Typography>

                                    <Divider sx={{ my: 4 }} />
                                    
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" color="primary" /> Préfixes de numérotation
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <TextField
                                            label="Préfixe Facture"
                                            value={form.invoice_prefix || ''}
                                            onChange={e => handleChange('invoice_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                        <TextField
                                            label="Préfixe Reçu"
                                            value={form.receipt_prefix || ''}
                                            onChange={e => handleChange('receipt_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                        <TextField
                                            label="Préfixe Vente"
                                            value={form.sell_code_prefix || ''}
                                            onChange={e => handleChange('sell_code_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" fontWeight={700} mb={3}>Détails de l'entreprise</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Nom Commercial"
                                            value={form.store_name || ''}
                                            onChange={e => handleChange('store_name', e.target.value)}
                                            fullWidth
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Slogan / Baseline"
                                            value={form.store_slogan || ''}
                                            onChange={e => handleChange('store_slogan', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Gérant / Propriétaire"
                                            value={form.owner_name || ''}
                                            onChange={e => handleChange('owner_name', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Email Professionnel"
                                            value={form.email || ''}
                                            onChange={e => handleChange('email', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="N° Téléphone Principal"
                                            value={form.phone || ''}
                                            onChange={e => handleChange('phone', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="N° SIRET / Registre Commerce"
                                            value={form.registration_number || ''}
                                            onChange={e => handleChange('registration_number', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Adresse Physique"
                                            value={form.address || ''}
                                            onChange={e => handleChange('address', e.target.value)}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Ville"
                                            value={form.city || ''}
                                            onChange={e => handleChange('city', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Site Web"
                                            value={form.website || ''}
                                            onChange={e => handleChange('website', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Box mt={4}>
                                    <Typography variant="h6" fontWeight={700} mb={2}>En-tête & Pied de Page des Documents</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="En-tête des Tickets (Receipt Header)"
                                                value={form.receipt_header || ''}
                                                onChange={e => handleChange('receipt_header', e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                size="small"
                                                placeholder="Bienvenue dans notre boutique !"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Pied de Page Tickets"
                                                value={form.receipt_footer || ''}
                                                onChange={e => handleChange('receipt_footer', e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Pied de Page Factures PDF"
                                                value={form.invoice_footer || ''}
                                                onChange={e => handleChange('invoice_footer', e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── SECTION 1: STOCK & POS ── */}
                    <TabPanel value={tab} index={1}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', borderColor: 'warning.light' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                            <InventoryIcon color="warning" />
                                            <Typography variant="h6" fontWeight={700}>Politique de Stock</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 3 }} />
                                        <Box display="flex" flexDirection="column" gap={3}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={form.low_stock_alert_enabled ?? true}
                                                        onChange={e => handleChange('low_stock_alert_enabled', e.target.checked)}
                                                        color="warning"
                                                    />
                                                }
                                                label={<Typography fontWeight={600}>Alertes stock critique</Typography>}
                                            />
                                            
                                            <TextField
                                                label="Seuil d'alerte global"
                                                type="number"
                                                value={form.low_stock_threshold ?? 5}
                                                onChange={e => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                                                disabled={!form.low_stock_alert_enabled}
                                                fullWidth
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start"><OfferIcon sx={{ opacity: 0.5 }} /></InputAdornment> }}
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={form.negative_stock_allowed ?? false}
                                                        onChange={e => handleChange('negative_stock_allowed', e.target.checked)}
                                                        color="error"
                                                    />
                                                }
                                                label={<Typography fontWeight={600}>Autoriser stock négatif</Typography>}
                                            />
                                             <Typography variant="caption" color="text.secondary">
                                                Attention : l'autorisation des stocks négatifs peut fausser vos rapports de rentabilité.
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', borderColor: 'primary.light' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                            <PaymentsIcon color="primary" />
                                            <Typography variant="h6" fontWeight={700}>Paramètres de Caisse</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 3 }} />
                                        <Box display="flex" flexDirection="column" gap={3}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={form.require_cash_session ?? true}
                                                        onChange={e => handleChange('require_cash_session', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={<Typography fontWeight={600}>Sessions obligatoires</Typography>}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Le caissier devra systématiquement ouvrir une session avec un fonds de roulement avant de pouvoir vendre.
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── SECTION 2: RÉGIONALISATION ── */}
                    <TabPanel value={tab} index={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight={700} mb={3}>Préférences locales</Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Devise (ISO)"
                                    value={form.currency || ''}
                                    onChange={e => handleChange('currency', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="XAF"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Symbole d’affichage"
                                    value={form.currency_symbol || ''}
                                    onChange={e => handleChange('currency_symbol', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="FCFA"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Fuseau Horaire"
                                    value={form.timezone || ''}
                                    onChange={e => handleChange('timezone', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="Africa/Douala"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Langue Défaut"
                                    value={form.locale || ''}
                                    onChange={e => handleChange('locale', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="fr"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};

export default StoreSettingsPage;
