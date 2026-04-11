import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Grid, Switch,
    FormControlLabel, TextField, CircularProgress, Chip, IconButton,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Divider, Paper, useTheme
} from '@mui/material';
import {
    Storage as StorageIcon, CloudUpload, CloudDownload, Refresh,
    Delete, Settings, Google, SyncAlt, Download,
    Upload, RestartAlt, Science, Folder, CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '@/Data/Utilities/Toast';
import { useTranslation } from "react-i18next";

const ipc = (window as any).ipcRenderer;

interface DbInfo {
    path: string;
    size: number;
    lastModified: string;
    exists: boolean;
}

interface DriveBackup {
    id: string;
    name: string;
    size: string;
    createdTime: string;
    modifiedTime: string;
}

interface DriveStatus {
    configured: boolean;
    authenticated: boolean;
    autoSyncEnabled: boolean;
    autoSyncInterval: number;
    lastSyncTime: string;
    lastSyncDirection: string;
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const DatabaseManagement: React.FC = () => {
    const {t} = useTranslation();
    const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
    const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
    const [backups, setBackups] = useState<DriveBackup[]>([]);
    const [loading, setLoading] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; title: string; message: string }>({ open: false, action: '', title: '', message: '' });
    const [gdriveConfig, setGdriveConfig] = useState({ clientId: '', clientSecret: '' });
    const [showConfig, setShowConfig] = useState(false);

    const loadDbInfo = useCallback(async () => {
        if (!ipc?.dbGetInfo) return;
        const info = await ipc.dbGetInfo();
        setDbInfo(info);
    }, []);

    const loadDriveStatus = useCallback(async () => {
        if (!ipc?.gdriveStatus) return;
        const status = await ipc.gdriveStatus();
        setDriveStatus(status);
    }, []);

    const loadBackups = useCallback(async () => {
        if (!ipc?.gdriveListBackups) return;
        const result = await ipc.gdriveListBackups();
        if (result?.success) setBackups(result.files || []);
    }, []);

    useEffect(() => {
        loadDbInfo();
        loadDriveStatus();
    }, [loadDbInfo, loadDriveStatus]);

    // ─── DB Actions ────────────────────────────────

    const handleExport = async () => {
        setLoading('export');
        const result = await ipc.dbExport();
        setLoading('');
        if (result?.success) Toast.success(t('database.exportSuccess'));
        else if (result?.error !== 'Annulé') Toast.error(result?.error || t('common.error'));
    };

    const handleImport = async () => {
        setLoading('import');
        const result = await ipc.dbImport();
        setLoading('');
        if (result?.success) {
            Toast.success(t('database.importSuccess'));
            loadDbInfo();
        } else if (result?.error !== 'Annulé') Toast.error(result?.error || t('common.error'));
    };

    const handleReset = async () => {
        setLoading('reset');
        const result = await ipc.dbReset();
        setLoading('');
        setConfirmDialog({ ...confirmDialog, open: false });
        if (result?.success) {
            Toast.success(t('database.resetSuccess'));
            loadDbInfo();
        } else Toast.error(t('database.resetError'));
    };

    const handleSeedDemo = async () => {
        setLoading('demo');
        const result = await ipc.dbSeedDemo();
        setLoading('');
        setConfirmDialog({ ...confirmDialog, open: false });
        if (result?.success) Toast.success(t('database.demoSuccess'));
        else Toast.error(t('database.demoError'));
    };

    // ─── Google Drive Actions ──────────────────────

    const handleGdriveAuth = async () => {
        setLoading('gdrive-auth');
        const result = await ipc.gdriveAuth();
        setLoading('');
        if (result?.success) {
            Toast.success(t('database.gdriveConnected'));
            loadDriveStatus();
            loadBackups();
        } else Toast.error(result?.error || t('database.gdriveConnectError'));
    };

    const handleGdriveUpload = async () => {
        setLoading('gdrive-upload');
        const result = await ipc.gdriveUpload();
        setLoading('');
        if (result?.success) {
            Toast.success(t('database.backupUploaded', {fileName: result.fileName}));
            loadBackups();
            loadDriveStatus();
        } else Toast.error(result?.error || t('common.error'));
    };

    const handleGdriveDownload = async (fileId: string, fileName: string) => {
        setLoading(`gdrive-download-${fileId}`);
        const result = await ipc.gdriveDownload(fileId);
        setLoading('');
        if (result?.success) {
            Toast.success(t('database.restoreSuccess', {fileName}));
            loadDbInfo();
            loadDriveStatus();
        } else Toast.error(result?.error || t('common.error'));
    };

    const handleGdriveDelete = async (fileId: string) => {
        setLoading(`gdrive-delete-${fileId}`);
        const result = await ipc.gdriveDeleteBackup(fileId);
        setLoading('');
        if (result?.success) {
            Toast.success(t('database.backupDeleted'));
            loadBackups();
        } else Toast.error(result?.error || t('common.error'));
    };

    const handleGdriveConfigure = async () => {
        if (!gdriveConfig.clientId || !gdriveConfig.clientSecret) {
            Toast.error(t('database.fillAllFields'));
            return;
        }
        await ipc.gdriveConfigure(gdriveConfig.clientId, gdriveConfig.clientSecret);
        Toast.success(t('database.configSaved'));
        loadDriveStatus();
        setShowConfig(false);
    };

    const handleAutoSyncToggle = async (enabled: boolean) => {
        await ipc.gdriveSetAutoSync(enabled, driveStatus?.autoSyncInterval || 30);
        loadDriveStatus();
    };

    const handleDisconnect = async () => {
        await ipc.gdriveDisconnect();
        setBackups([]);
        loadDriveStatus();
        Toast.success(t('database.gdriveDisconnected'));
    };

    const cardStyle = {
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        transition: 'all 0.3s',
        '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
    };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* ─── Database Info Card ─── */}
                <Grid item xs={12} md={6}>
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{ p: 1.2, borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                                    <StorageIcon sx={{ color: 'white', fontSize: 22 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>{t('database.database')}</Typography>
                                <Tooltip title={t('common.refresh')}><IconButton size="small" onClick={loadDbInfo}><Refresh fontSize="small" /></IconButton></Tooltip>
                            </Box>

                            {dbInfo ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>{t('database.size')}</Typography>
                                        <Chip label={formatBytes(dbInfo.size)} size="small" sx={{ fontWeight: 800, bgcolor: '#e0e7ff', color: '#4338ca' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>{t('database.lastModified')}</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                                            {dbInfo.lastModified ? new Date(dbInfo.lastModified).toLocaleString('fr-FR') : '—'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>{t('common.status')}</Typography>
                                        <Chip icon={dbInfo.exists ? <CheckCircle /> : <ErrorIcon />}
                                            label={dbInfo.exists ? t('database.active') : t('database.notFound')}
                                            size="small"
                                            color={dbInfo.exists ? 'success' : 'error'}
                                            sx={{ fontWeight: 800 }} />
                                    </Box>
                                </Box>
                            ) : <CircularProgress size={24} />}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── DB Actions Card ─── */}
                <Grid item xs={12} md={6}>
                    <Card sx={cardStyle}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 2.5 }}>{t('database.operations')}</Typography>
                            <Grid container spacing={1.5}>
                                <Grid item xs={6}>
                                    <Button fullWidth variant="outlined" startIcon={loading === 'export' ? <CircularProgress size={16} /> : <Download />}
                                        onClick={handleExport} disabled={!!loading}
                                        sx={{ borderRadius: '14px', fontWeight: 700, py: 1.2, textTransform: 'none' }}>
                                        {t('database.export')}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button fullWidth variant="outlined" startIcon={loading === 'import' ? <CircularProgress size={16} /> : <Upload />}
                                        onClick={handleImport} disabled={!!loading}
                                        sx={{ borderRadius: '14px', fontWeight: 700, py: 1.2, textTransform: 'none' }}>
                                        {t('database.import')}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button fullWidth variant="outlined" color="warning"
                                        startIcon={loading === 'demo' ? <CircularProgress size={16} /> : <Science />}
                                        disabled={!!loading}
                                        onClick={() => setConfirmDialog({
                                            open: true, action: 'demo',
                                            title: t('database.demoConfirmTitle'),
                                            message: t('database.demoConfirmMessage')
                                        })}
                                        sx={{ borderRadius: '14px', fontWeight: 700, py: 1.2, textTransform: 'none' }}>
                                        {t('database.demoData')}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button fullWidth variant="outlined" color="error"
                                        startIcon={loading === 'reset' ? <CircularProgress size={16} /> : <RestartAlt />}
                                        disabled={!!loading}
                                        onClick={() => setConfirmDialog({
                                            open: true, action: 'reset',
                                            title: t('database.resetConfirmTitle'),
                                            message: t('database.resetConfirmMessage')
                                        })}
                                        sx={{ borderRadius: '14px', fontWeight: 700, py: 1.2, textTransform: 'none' }}>
                                        {t('database.reset')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── Google Drive Sync ─── */}
                <Grid item xs={12}>
                    <Card sx={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(66,133,244,0.03) 0%, rgba(52,168,83,0.03) 100%)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1.2, borderRadius: '14px', background: 'linear-gradient(135deg, #4285F4, #34A853)' }}>
                                        <Google sx={{ color: 'white', fontSize: 22 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>Google Drive</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            {driveStatus?.authenticated ? t('database.connected') : t('database.notConnected')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title={t('settings.title')}>
                                        <IconButton size="small" onClick={() => setShowConfig(!showConfig)}>
                                            <Settings fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {driveStatus?.authenticated && (
                                        <Chip label={t('database.disconnect')} size="small" onClick={handleDisconnect}
                                            sx={{ fontWeight: 700, cursor: 'pointer' }} color="error" variant="outlined" />
                                    )}
                                </Box>
                            </Box>

                            {/* Config Panel */}
                            <AnimatePresence>
                                {showConfig && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.8)' }}>
                                            <Typography sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5, fontSize: '0.9rem' }}>{t('database.oauthConfig')}</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={5}>
                                                    <TextField fullWidth size="small" label="Client ID" value={gdriveConfig.clientId}
                                                        onChange={(e) => setGdriveConfig({ ...gdriveConfig, clientId: e.target.value })}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                                </Grid>
                                                <Grid item xs={12} md={5}>
                                                    <TextField fullWidth size="small" label="Client Secret" type="password"
                                                        value={gdriveConfig.clientSecret}
                                                        onChange={(e) => setGdriveConfig({ ...gdriveConfig, clientSecret: e.target.value })}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <Button fullWidth variant="contained" onClick={handleGdriveConfigure}
                                                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, height: '100%' }}>
                                                        {t('common.save')}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                                                {t('database.oauthInstructions')}
                                            </Alert>
                                        </Paper>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Connection / Actions */}
                            {!driveStatus?.authenticated ? (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <Button variant="contained" size="large"
                                        startIcon={loading === 'gdrive-auth' ? <CircularProgress size={20} color="inherit" /> : <Google />}
                                        onClick={handleGdriveAuth}
                                        disabled={!!loading || !driveStatus?.configured}
                                        sx={{
                                            borderRadius: '16px', textTransform: 'none', fontWeight: 800,
                                            background: 'linear-gradient(135deg, #4285F4, #34A853)',
                                            px: 4, py: 1.5, fontSize: '1rem',
                                            '&:hover': { background: 'linear-gradient(135deg, #3367D6, #2E7D42)' },
                                        }}>
                                        {t('database.connectGoogle')}
                                    </Button>
                                    {!driveStatus?.configured && (
                                        <Typography sx={{ mt: 1, color: '#f59e0b', fontWeight: 600, fontSize: '0.8rem' }}>
                                            {t('database.configureFirst')}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Box>
                                    {/* Sync Actions */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                        <Button variant="contained" startIcon={loading === 'gdrive-upload' ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                                            onClick={handleGdriveUpload} disabled={!!loading}
                                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700, background: '#4285F4', '&:hover': { background: '#3367D6' } }}>
                                            {t('database.backupNow')}
                                        </Button>
                                        <Button variant="outlined" startIcon={<Refresh />}
                                            onClick={loadBackups} disabled={!!loading}
                                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}>
                                            {t('database.viewBackups')}
                                        </Button>
                                        <FormControlLabel
                                            control={<Switch checked={driveStatus?.autoSyncEnabled || false} onChange={(e) => handleAutoSyncToggle(e.target.checked)} />}
                                            label={<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('database.autoSync', {interval: driveStatus?.autoSyncInterval || 30})}</Typography>}
                                        />
                                    </Box>

                                    {/* Last Sync Info */}
                                    {driveStatus?.lastSyncTime && (
                                        <Alert severity="success" sx={{ borderRadius: '12px', mb: 2 }} icon={<SyncAlt />}>
                                            {t('database.lastSync')}: <strong>{new Date(driveStatus.lastSyncTime).toLocaleString('fr-FR')}</strong>
                                            {' — '}{driveStatus.lastSyncDirection === 'upload' ? '⬆️ ' + t('database.upload') : '⬇️ ' + t('database.download')}
                                        </Alert>
                                    )}

                                    {/* Backups List */}
                                    {backups.length > 0 && (
                                        <Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                                                {t('database.backups', {count: backups.length})}
                                            </Typography>
                                            {backups.map((backup) => (
                                                <Paper key={backup.id} sx={{
                                                    p: 2, mb: 1, borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    border: '1px solid rgba(0,0,0,0.06)',
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Folder sx={{ color: '#4285F4' }} />
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{backup.name}</Typography>
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                {new Date(backup.createdTime).toLocaleString('fr-FR')}
                                                                {backup.size ? ` — ${formatBytes(parseInt(backup.size))}` : ''}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title={t('database.restoreBackup')}>
                                                            <IconButton size="small" color="primary"
                                                                disabled={loading === `gdrive-download-${backup.id}`}
                                                                onClick={() => handleGdriveDownload(backup.id, backup.name)}>
                                                                {loading === `gdrive-download-${backup.id}` ? <CircularProgress size={16} /> : <CloudDownload fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('common.delete')}>
                                                            <IconButton size="small" color="error"
                                                                disabled={loading === `gdrive-delete-${backup.id}`}
                                                                onClick={() => handleGdriveDelete(backup.id)}>
                                                                {loading === `gdrive-delete-${backup.id}` ? <CircularProgress size={16} /> : <Delete fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ─── Confirmation Dialog ─── */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#64748b' }}>{confirmDialog.message}</Typography>
                    {confirmDialog.action === 'reset' && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                            {t('database.resetWarning')}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="contained"
                        color={confirmDialog.action === 'reset' ? 'error' : 'warning'}
                        onClick={confirmDialog.action === 'reset' ? handleReset : handleSeedDemo}
                        disabled={!!loading}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
                        {loading ? <CircularProgress size={20} /> : t('common.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DatabaseManagement;
