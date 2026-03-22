import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Alert, CircularProgress,
    InputAdornment, Divider, Chip
} from '@mui/material';
import { Lock, CheckCircle, Warning } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { closeSession } from '@/Data/Slices/dashboard/cashSessionSlice';
import CashSessionAPI from '@/Data/Api/CashSession';
import UtilMethods from '@/Data/Utilities/UtilMethods';
import ZReportPrintable from './ZReportPrintable';

interface SessionCloseModalProps {
    open: boolean;
    onClose: () => void;
}

const SessionCloseModal = ({ open, onClose }: SessionCloseModalProps) => {
    const dispatch = useAppDispatch();
    const { currentSession, isClosing, error } = useAppSelector((state) => state.cashSession);
    const [actualCash, setActualCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [summary, setSummary] = useState<any>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Z-Report_${currentSession?.session_code || 'Session'}`,
    });

    useEffect(() => {
        if (open && currentSession) {
            setLoadingSummary(true);
            CashSessionAPI.summary(currentSession.id)
                .then((res) => {
                    setSummary(res.data);
                })
                .catch(console.error)
                .finally(() => setLoadingSummary(false));
        }
    }, [open, currentSession]);

    const handleClose = async () => {
        if (!currentSession) return;
        const cash = parseFloat(actualCash);
        if (isNaN(cash) || cash < 0) return;

        const result = await dispatch(closeSession({
            sessionId: currentSession.id,
            payload: {
                actual_cash: cash,
                notes: notes || undefined,
            },
        }));

        if (closeSession.fulfilled.match(result)) {
            setActualCash('');
            setNotes('');
            setSummary(null);
            onClose();
        }
    };

    const expectedCash = summary?.stats?.expected_cash ?? (
        currentSession
            ? Number(currentSession?.opening_balance ?? 0) + Number(currentSession?.total_cash_payments ?? 0) - Number(currentSession?.total_refunds ?? 0)
            : 0
    );

    const difference = actualCash ? (parseFloat(actualCash) || 0) - (expectedCash || 0) : null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '24px', overflow: 'hidden' }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    p: 3,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                    }}>
                        <Lock sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            Fermeture de Caisse
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Session: {currentSession?.session_code}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {loadingSummary ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            mb: 3,
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 2 }}>
                                Résumé de la session
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Chip
                                    label={`${summary?.stats?.sales_count ?? currentSession?.sales_count ?? 0} ventes`}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                />
                                {(summary?.stats?.canceled_count ?? 0) > 0 && (
                                    <Chip
                                        label={`${summary?.stats?.canceled_count} annulées`}
                                        color="error"
                                        size="small"
                                        sx={{ fontWeight: 700 }}
                                    />
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Fonds de départ</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {UtilMethods.formatNumber(currentSession?.opening_balance ?? 0)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Total des ventes</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        + {UtilMethods.formatNumber(summary?.stats?.total_sales ?? currentSession?.total_sales ?? 0)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Remboursements</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                        - {UtilMethods.formatNumber(summary?.stats?.total_refunds ?? currentSession?.total_refunds ?? 0)}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>Cash théorique attendu</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                        {UtilMethods.formatNumber(expectedCash)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Cash réel compté"
                            type="number"
                            value={actualCash}
                            onChange={(e) => setActualCash(e.target.value)}
                            autoFocus
                            InputProps={{
                                endAdornment: <InputAdornment position="end">XAF</InputAdornment>,
                                sx: { borderRadius: '12px', fontSize: '1.5rem', fontWeight: 700 }
                            }}
                            sx={{ mb: 2 }}
                        />

                        {difference !== null && !isNaN(difference) && (
                            <Alert
                                severity={Math.abs(difference) < 100 ? 'success' : difference > 0 ? 'warning' : 'error'}
                                icon={Math.abs(difference) < 100 ? <CheckCircle /> : <Warning />}
                                sx={{ mb: 3, borderRadius: '12px' }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Écart: {UtilMethods.formatNumber(difference ?? 0)}
                                    {Math.abs(difference) < 100
                                        ? ' — Caisse équilibrée'
                                        : difference > 0
                                            ? ' — Excédent de caisse'
                                            : ' — Déficit de caisse'
                                    }
                                </Typography>
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Notes de clôture (optionnel)"
                            multiline
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observations sur la session..."
                            InputProps={{
                                sx: { borderRadius: '12px' }
                            }}
                        />
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    onClick={handlePrint}
                    variant="outlined"
                    disabled={!currentSession || !summary}
                    color="primary"
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                    Imprimer Rapport Z
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        onClick={onClose}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        disabled={isClosing || !actualCash || parseFloat(actualCash) < 0}
                        startIcon={isClosing ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 4,
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            }
                        }}
                    >
                        Fermer la Caisse
                    </Button>
                </Box>
            </DialogActions>

            <Box sx={{ display: 'none' }}>
                {currentSession && summary && (
                    <ZReportPrintable
                        ref={componentRef}
                        session={currentSession}
                        summary={summary}
                        actualCash={parseFloat(actualCash) || 0}
                        difference={difference || 0}
                        closingNotes={notes}
                    />
                )}
            </Box>
        </Dialog>
    );
};

export default SessionCloseModal;
