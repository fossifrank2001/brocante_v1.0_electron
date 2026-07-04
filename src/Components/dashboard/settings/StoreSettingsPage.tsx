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
    Loyalty as LoyaltyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import StoreSettingAPI from '@/Data/Api/StoreSetting';
import { IStoreSetting, IStoreSettingPayload } from '@/Data/Interfaces/StoreSetting';
import Toast from '@/Data/Utilities/Toast';
import constants from '@/Data/Utilities/constants';
import DatabaseManagement from './DatabaseManagement';
import { Storage as StorageTabIcon } from '@mui/icons-material';
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation();
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
            Toast.error(t('settings.loadError'));
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
            Toast.success(t('settings.saveSuccess'));
        } catch (e: any) {
            Toast.error(e?.message || t('settings.saveError'));
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
                Toast.success(t('settings.logoUpdated'));
            } else {
                setForm(prev => ({ ...prev, signature_path: response.data.signature_path }));
                Toast.success(t('settings.signatureUpdated'));
            }
        } catch (err: any) {
            Toast.error(err?.message || t('settings.uploadError', {type}));
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
                                {t('settings.title')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {t('settings.subtitle')}
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
                        {saving ? t('settings.saving') : t('common.save')}
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
                        {t('settings.unsavedChanges')}
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
                        <Tab icon={<StoreIcon />} iconPosition="start" label={t('settings.tabs.identity')} />
                        <Tab icon={<InventoryIcon />} iconPosition="start" label={t('settings.tabs.stockPos')} />
                        <Tab icon={<LoyaltyIcon />} iconPosition="start" label={t('settings.tabs.loyalty')} />
                        <Tab icon={<StorageTabIcon />} iconPosition="start" label={t('settings.tabs.database')} />
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {/* ── SECTION 0: IDENTITÉ ── */}
                    <TabPanel value={tab} index={0}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>{t('settings.logo.title')}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    {t('settings.logo.description')}
                                </Typography>
                                
                                <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: '20px' }}>
                                    <Avatar
                                        key={settings?.logo_url}
                                        src={settings?.logo_url}
                                        sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            mx: 'auto',
                                            mb: 2,
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                            bgcolor: 'primary.light',
                                            '& img': { objectFit: 'contain' }
                                        }}
                                    >
                                        {!settings?.logo_url && <StoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
                                    </Avatar>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        size="medium"
                                        startIcon={<UploadIcon />}
                                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                                    >
                                        {t('settings.logo.upload')}
                                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                    </Button>

                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 4, mb: 1.5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" color="primary" /> {t('settings.signature.title')}
                                    </Typography>
                                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: '#fcfcfc', mb: 2 }}>
                                        <Avatar
                                            key={settings?.signature_url}
                                            variant="square"
                                            src={settings?.signature_url || undefined}
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
                                            {!settings?.signature_url && <Typography variant="caption" color="text.secondary">{t('settings.signature.none')}</Typography>}
                                        </Avatar>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            startIcon={<UploadIcon />}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            {t('settings.signature.change')}
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleLogoUpload(e, 'signature')} />
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                        {t('settings.logo.fileHint')}
                                    </Typography>

                                    <Divider sx={{ my: 4 }} />
                                    
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" color="primary" /> {t('settings.prefixes.title')}
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <TextField
                                            label={t('settings.prefixes.invoice')}
                                            value={form.invoice_prefix || ''}
                                            onChange={e => handleChange('invoice_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                        <TextField
                                            label={t('settings.prefixes.receipt')}
                                            value={form.receipt_prefix || ''}
                                            onChange={e => handleChange('receipt_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                        <TextField
                                            label={t('settings.prefixes.sell')}
                                            value={form.sell_code_prefix || ''}
                                            onChange={e => handleChange('sell_code_prefix', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" fontWeight={700} mb={3}>{t('settings.companyDetails.title')}</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('settings.companyDetails.storeName')}
                                            value={form.store_name || ''}
                                            onChange={e => handleChange('store_name', e.target.value)}
                                            fullWidth
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('settings.companyDetails.slogan')}
                                            value={form.store_slogan || ''}
                                            onChange={e => handleChange('store_slogan', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('settings.companyDetails.owner')}
                                            value={form.owner_name || ''}
                                            onChange={e => handleChange('owner_name', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('auth.email')}
                                            value={form.email || ''}
                                            onChange={e => handleChange('email', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('user.phone')}
                                            value={form.phone || ''}
                                            onChange={e => handleChange('phone', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('settings.companyDetails.registrationNumber')}
                                            value={form.registration_number || ''}
                                            onChange={e => handleChange('registration_number', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label={t('settings.companyDetails.address')}
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
                                            label={t('settings.companyDetails.city')}
                                            value={form.city || ''}
                                            onChange={e => handleChange('city', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label={t('settings.companyDetails.website')}
                                            value={form.website || ''}
                                            onChange={e => handleChange('website', e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Box mt={4}>
                                    <Typography variant="h6" fontWeight={700} mb={3}>{t('settings.regional.title')}</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                label={t('settings.regional.currency')}
                                                value={form.currency || ''}
                                                onChange={e => handleChange('currency', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="XAF"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                label={t('settings.regional.currencySymbol')}
                                                value={form.currency_symbol || ''}
                                                onChange={e => handleChange('currency_symbol', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="FCFA"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                label={t('settings.regional.timezone')}
                                                value={form.timezone || ''}
                                                onChange={e => handleChange('timezone', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="Africa/Douala"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                label={t('settings.regional.language')}
                                                value={form.locale || ''}
                                                onChange={e => handleChange('locale', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="fr"
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
                                            <Typography variant="h6" fontWeight={700}>{t('settings.stockPolicy.title')}</Typography>
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
                                                label={<Typography fontWeight={600}>{t('settings.stockPolicy.lowStockAlert')}</Typography>}
                                            />
                                            
                                            <TextField
                                                label={t('settings.stockPolicy.threshold')}
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
                                                label={<Typography fontWeight={600}>{t('settings.stockPolicy.negativeStock')}</Typography>}
                                            />
                                             <Typography variant="caption" color="text.secondary">
                                                {t('settings.stockPolicy.negativeStockWarning')}
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
                                            <Typography variant="h6" fontWeight={700}>{t('settings.cashRegister.title')}</Typography>
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
                                                label={<Typography fontWeight={600}>{t('settings.cashRegister.requiredSessions')}</Typography>}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {t('settings.cashRegister.sessionsDescription')}
                                            </Typography>

                                            <Divider />

                                            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>{t('settings.cashRegister.creditPolicy')}</Typography>
                                            <TextField
                                                label={t('settings.cashRegister.maxUnpaidLoans')}
                                                type="number"
                                                value={form.max_unpaid_loans ?? 3}
                                                onChange={e => handleChange('max_unpaid_loans', parseInt(e.target.value) || 0)}
                                                fullWidth
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start"><OfferIcon sx={{ opacity: 0.5 }} /></InputAdornment> }}
                                                helperText={t('settings.cashRegister.maxUnpaidLoansDescription')}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── SECTION 2: FIDÉLITÉ ── */}
                    <TabPanel value={tab} index={2}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', borderColor: 'secondary.light' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                            <LoyaltyIcon color="secondary" />
                                            <Typography variant="h6" fontWeight={700}>{t('settings.loyalty.title')}</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 3 }} />
                                        <Box display="flex" flexDirection="column" gap={3}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={form.loyalty_enabled ?? false}
                                                        onChange={e => handleChange('loyalty_enabled', e.target.checked)}
                                                        color="secondary"
                                                    />
                                                }
                                                label={<Typography fontWeight={600}>{t('settings.loyalty.enableProgram')}</Typography>}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {t('settings.loyalty.enableDescription')}
                                            </Typography>

                                            <Divider />

                                            <TextField
                                                label={t('settings.loyalty.pointsPerHundred')}
                                                type="number"
                                                value={form.loyalty_points_per_hundred ?? 1}
                                                onChange={e => handleChange('loyalty_points_per_hundred', parseFloat(e.target.value) || 0)}
                                                disabled={!form.loyalty_enabled}
                                                fullWidth
                                                size="small"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><LoyaltyIcon sx={{ opacity: 0.5, fontSize: 20 }} /></InputAdornment>,
                                                    endAdornment: <InputAdornment position="end">pts / 100</InputAdornment>,
                                                }}
                                                helperText={t('settings.loyalty.pointsHelper')}
                                            />

                                            <Divider />

                                            <TextField
                                                label={t('settings.loyalty.pointValue')}
                                                type="number"
                                                value={form.loyalty_points_value ?? 1}
                                                onChange={e => handleChange('loyalty_points_value', parseFloat(e.target.value) || 0)}
                                                disabled={!form.loyalty_enabled}
                                                fullWidth
                                                size="small"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><OfferIcon sx={{ opacity: 0.5, fontSize: 20 }} /></InputAdornment>,
                                                }}
                                                helperText={t('settings.loyalty.pointValueHelper')}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ borderRadius: '16px', height: '100%', borderColor: 'divider' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                            <OfferIcon color="primary" />
                                            <Typography variant="h6" fontWeight={700}>{t('settings.loyalty.howItWorks')}</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 3 }} />
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('settings.loyalty.explanation1')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('settings.loyalty.explanation2')}
                                            </Typography>
                                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                                                    {t('settings.loyalty.example')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {t('settings.loyalty.exampleDetail', { rate: form.loyalty_points_per_hundred ?? 1 })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* ── SECTION 3: BASE DE DONNÉES ── */}
                    <TabPanel value={tab} index={3}>
                        <DatabaseManagement />
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};

export default StoreSettingsPage;
