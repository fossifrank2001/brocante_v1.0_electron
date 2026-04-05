import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Alert, CircularProgress,
    InputAdornment
} from '@mui/material';
import { PointOfSale, PlayArrow } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { openSession } from '@/Data/Slices/dashboard/cashSessionSlice';
import { useTranslation } from 'react-i18next';

interface SessionOpenModalProps {
    open: boolean;
    onClose: () => void;
}

const SessionOpenModal = ({ open, onClose }: SessionOpenModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.cashSession);
    const [openingBalance, setOpeningBalance] = useState<string>('0');
    const [notes, setNotes] = useState('');

    const handleOpen = async () => {
        const balance = parseFloat(openingBalance);
        if (isNaN(balance) || balance < 0) return;

        const result = await dispatch(openSession({
            opening_balance: balance,
            notes: notes || undefined,
        }));

        if (openSession.fulfilled.match(result)) {
            setOpeningBalance('0');
            setNotes('');
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                        <PointOfSale sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            {t('cashSession.openingTitle')}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {t('cashSession.openingSubtitle')}
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

                <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
                    {t('cashSession.countCashBeforeStart')}
                </Alert>

                <TextField
                    fullWidth
                    label={t('cashSession.openingBalance')}
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    autoFocus
                    InputProps={{
                        endAdornment: <InputAdornment position="end">XAF</InputAdornment>,
                        sx: { borderRadius: '12px', fontSize: '1.5rem', fontWeight: 700 }
                    }}
                    sx={{ mb: 3 }}
                />

                <TextField
                    fullWidth
                    label={t('cashSession.notesOptional')}
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('cashSession.notesPlaceholder')}
                    InputProps={{
                        sx: { borderRadius: '12px' }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onClose}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleOpen}
                    variant="contained"
                    disabled={isLoading || parseFloat(openingBalance) < 0}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        px: 4,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        }
                    }}
                >
                    {t('cashSession.openCashRegister')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionOpenModal;
