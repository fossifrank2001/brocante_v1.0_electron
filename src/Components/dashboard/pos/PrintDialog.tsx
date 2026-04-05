import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import PrinterService, { PrinterInfo } from '@/Services/PrinterService';
import ReceiptTemplate, { ISellWithDetails } from '@/Services/ReceiptTemplate';
import { useAppSelector } from '@/hooks';
import constants from '@/Data/Utilities/constants';
import { useTranslation } from 'react-i18next';

interface Props {
    open: boolean;
    onClose: () => void;
    sellData: ISellWithDetails | null;
}

const PrintDialog = ({ open, onClose, sellData }: Props) => {
    const { t } = useTranslation();
    const { authUser } = useAppSelector((state) => state.user);
    const { currentSession } = useAppSelector((state) => state.cashSession);
    const [printers, setPrinters] = useState<PrinterInfo[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadPrinters();
        }
    }, [open]);

    const loadPrinters = async () => {
        setLoading(true);
        try {
            const list = await PrinterService.getPrinters();
            setPrinters(list);
            const defaultP = list.find(p => p.isDefault);
            if (defaultP) setSelectedPrinter(defaultP.name);
        } catch (e) {
            setError(t('printDialog.printerLoadError'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        if (!sellData || !selectedPrinter) return;
        setPrinting(true);
        setError(null);
        try {
            const html = ReceiptTemplate.generate58mm({
                sell: sellData,
                storeName: constants.APP_NAME,
                cashierName: authUser?.first_name + ' ' + authUser?.last_name || t('pos.cashier'),
                sessionId: currentSession?.id || 0,
            });
            const result = await PrinterService.printHTML(selectedPrinter, html);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || t('printDialog.printFailed'));
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setPrinting(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!sellData) return;

        // Use constants.BASE_URL (dynamic getter with IPC-resolved URL)
        const baseURL = constants.BASE_URL;
        const token = localStorage.getItem('token');
        const url = `${baseURL}/sells/${sellData.id}/pdf-receipt?token=${token}`;

        window.open(url, '_blank');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('printDialog.printReceipt')}</DialogTitle>
            <DialogContent>
                {loading ? <CircularProgress size={24} /> : (
                    <>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>{t('printDialog.printer')}</InputLabel>
                            <Select value={selectedPrinter} onChange={(e) => setSelectedPrinter(e.target.value)} label={t('printDialog.printer')}>
                                {printers.map(p => <MenuItem key={p.name} value={p.name}>{p.displayName}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">{t('common.cancel')}</Button>
                <Button onClick={handleDownloadPDF} startIcon={<Download />} color="secondary">
                    PDF
                </Button>
                <Button onClick={handlePrint} disabled={!selectedPrinter || printing} startIcon={printing ? <CircularProgress size={16} /> : <Print />} variant="contained">
                    {t('printDialog.thermalTicket')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrintDialog;
