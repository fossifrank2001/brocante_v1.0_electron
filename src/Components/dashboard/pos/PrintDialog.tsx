import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { Print } from '@mui/icons-material';
import PrinterService, { PrinterInfo } from '@/Services/PrinterService';
import ReceiptTemplate, { ISellWithDetails } from '@/Services/ReceiptTemplate';
import { useAppSelector } from '@/hooks';

interface Props {
    open: boolean;
    onClose: () => void;
    sellData: ISellWithDetails | null;
}

const PrintDialog = ({ open, onClose, sellData }: Props) => {
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
            setError('Erreur chargement imprimantes');
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
                storeName: 'Brocante',
                cashierName: authUser?.first_name + ' ' + authUser?.last_name || 'Caissier',
                sessionId: currentSession?.id || 0,
            });
            const result = await PrinterService.printHTML(selectedPrinter, html);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Échec impression');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Imprimer le ticket</DialogTitle>
            <DialogContent>
                {loading ? <CircularProgress size={24} /> : (
                    <>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>Imprimante</InputLabel>
                            <Select value={selectedPrinter} onChange={(e) => setSelectedPrinter(e.target.value)} label="Imprimante">
                                {printers.map(p => <MenuItem key={p.name} value={p.name}>{p.displayName}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handlePrint} disabled={!selectedPrinter || printing} startIcon={printing ? <CircularProgress size={16} /> : <Print />} variant="contained">
                    Imprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrintDialog;
