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
    Chip,
} from '@mui/material';
import {
    Save as SaveIcon,
    Store as StoreIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    CloudUpload as UploadIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import StoreSettingAPI from '@/Data/Api/StoreSetting';
import { IStoreSetting, IStoreSettingPayload } from '@/Data/Interfaces/StoreSetting';
import Toast from '@/Data/Utilities/Toast';
import constants from '@/Data/Utilities/constants';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index} style={{ paddingTop: 24 }}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const StoreSettingsPage: React.FC = () => {
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
        } catch (e) {
            console.error('Error fetching store settings:', e);
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
            Toast.success('Paramètres enregistrés avec succès', 2000, 'top-right');
        } catch (e: any) {
            Toast.error(e?.message || 'Erreur lors de la sauvegarde', 2000, 'top-right');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const response = await StoreSettingAPI.uploadLogo(file);
            setSettings(response.data);
            Toast.success('Logo mis à jour', 2000, 'top-right');
        } catch (err: any) {
            Toast.error(err?.message || 'Erreur upload logo', 2000, 'top-right');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <SettingsIcon color="primary" />
                        Paramètres du magasin
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Configurez les informations de votre entreprise, devises, tickets et préférences de stock.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                >
                    Enregistrer
                </Button>
            </Box>

            {hasChanges && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Vous avez des modifications non enregistrées.
                </Alert>
            )}

            {/* Tabs */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                        <Tab icon={<StoreIcon />} iconPosition="start" label="Entreprise" sx={{ textTransform: 'none' }} />
                        <Tab icon={<ReceiptIcon />} iconPosition="start" label="Tickets & Factures" sx={{ textTransform: 'none' }} />
                        <Tab icon={<InventoryIcon />} iconPosition="start" label="Stock & Caisse" sx={{ textTransform: 'none' }} />
                    </Tabs>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {/* ── TAB 0: Entreprise ── */}
                    <TabPanel value={tab} index={0}>
                        {/* Logo */}
                        <Box display="flex" alignItems="center" gap={3} mb={4}>
                            <Avatar
                                src={settings?.logo_path ? `${constants.URL}/storage/${settings.logo_path}` : undefined}
                                sx={{ width: 80, height: 80, bgcolor: 'primary.light', fontSize: 32 }}
                            >
                                {!settings?.logo_path && <StoreIcon sx={{ fontSize: 40 }} />}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>Logo du magasin</Typography>
                                <Typography variant="caption" color="text.secondary">PNG, JPG, SVG — max 2 Mo</Typography>
                                <br />
                                <Button
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<UploadIcon />}
                                    sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
                                >
                                    Changer le logo
                                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nom du magasin"
                                    value={form.store_name || ''}
                                    onChange={e => handleChange('store_name', e.target.value)}
                                    fullWidth
                                    required
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Slogan"
                                    value={form.store_slogan || ''}
                                    onChange={e => handleChange('store_slogan', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="Votre slogan ici..."
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nom du propriétaire"
                                    value={form.owner_name || ''}
                                    onChange={e => handleChange('owner_name', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Email"
                                    value={form.email || ''}
                                    onChange={e => handleChange('email', e.target.value)}
                                    fullWidth
                                    size="small"
                                    type="email"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Téléphone principal"
                                    value={form.phone || ''}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Téléphone secondaire"
                                    value={form.phone_secondary || ''}
                                    onChange={e => handleChange('phone_secondary', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Adresse"
                                    value={form.address || ''}
                                    onChange={e => handleChange('address', e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Ville"
                                    value={form.city || ''}
                                    onChange={e => handleChange('city', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Pays"
                                    value={form.country || ''}
                                    onChange={e => handleChange('country', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Site web"
                                    value={form.website || ''}
                                    onChange={e => handleChange('website', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                                    Informations légales
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Numéro fiscal (Tax ID)"
                                    value={form.tax_id || ''}
                                    onChange={e => handleChange('tax_id', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="N° d'enregistrement"
                                    value={form.registration_number || ''}
                                    onChange={e => handleChange('registration_number', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                                    Régionalisation
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Devise"
                                    value={form.currency || ''}
                                    onChange={e => handleChange('currency', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="XAF"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Symbole devise"
                                    value={form.currency_symbol || ''}
                                    onChange={e => handleChange('currency_symbol', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="FCFA"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Fuseau horaire"
                                    value={form.timezone || ''}
                                    onChange={e => handleChange('timezone', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Langue"
                                    value={form.locale || ''}
                                    onChange={e => handleChange('locale', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="fr"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── TAB 1: Tickets & Factures ── */}
                    <TabPanel value={tab} index={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Préfixes de numérotation
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Préfixe facture"
                                    value={form.invoice_prefix || ''}
                                    onChange={e => handleChange('invoice_prefix', e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        endAdornment: <Chip label="ex: FAC-00001" size="small" variant="outlined" />,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Préfixe reçu"
                                    value={form.receipt_prefix || ''}
                                    onChange={e => handleChange('receipt_prefix', e.target.value)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        endAdornment: <Chip label="ex: REC-00001" size="small" variant="outlined" />,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Préfixe code vente"
                                    value={form.sell_code_prefix || ''}
                                    onChange={e => handleChange('sell_code_prefix', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Contenu tickets & factures
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="En-tête du ticket"
                                    value={form.receipt_header || ''}
                                    onChange={e => handleChange('receipt_header', e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="Texte affiché en haut du ticket..."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Pied de page du ticket"
                                    value={form.receipt_footer || ''}
                                    onChange={e => handleChange('receipt_footer', e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={3}
                                    placeholder="Merci de votre visite ! Conditions de retour..."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Pied de page facture"
                                    value={form.invoice_footer || ''}
                                    onChange={e => handleChange('invoice_footer', e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={3}
                                    placeholder="Conditions de paiement, mentions légales..."
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── TAB 2: Stock & Caisse ── */}
                    <TabPanel value={tab} index={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Gestion du stock
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.low_stock_alert_enabled ?? true}
                                            onChange={e => handleChange('low_stock_alert_enabled', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Activer les alertes de stock faible"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Seuil d'alerte stock faible"
                                    value={form.low_stock_threshold ?? 5}
                                    onChange={e => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                                    fullWidth
                                    size="small"
                                    type="number"
                                    disabled={!form.low_stock_alert_enabled}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.negative_stock_allowed ?? false}
                                            onChange={e => handleChange('negative_stock_allowed', e.target.checked)}
                                            color="warning"
                                        />
                                    }
                                    label="Autoriser le stock négatif"
                                />
                                <Typography variant="caption" color="text.secondary" display="block" ml={6}>
                                    Si désactivé, les ventes seront refusées quand le stock est insuffisant.
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                    Caisse
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.require_cash_session ?? true}
                                            onChange={e => handleChange('require_cash_session', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Session de caisse obligatoire pour vendre"
                                />
                                <Typography variant="caption" color="text.secondary" display="block" ml={6}>
                                    Si activé, un vendeur doit ouvrir une session de caisse avant de pouvoir enregistrer des ventes.
                                </Typography>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StoreSettingsPage;
