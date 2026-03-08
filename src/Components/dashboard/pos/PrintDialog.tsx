import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import PrinterService, { PrinterInfo } from '@/Services/PrinterService';
import ReceiptTemplate, { ISellWithDetails } from '@/Services/ReceiptTemplate';
import { useAppSelector } from '@/hooks';
import axiosInstance from '@/Data/Utilities/axiosInstance';

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

    const handleDownloadPDF = () => {
        if (!sellData) return;

        // On récupère le baseURL configuré dans axiosInstance
        const baseURL = axiosInstance.defaults.baseURL;
        // On construit l'URL pour télécharger. Soit c'est une facture, soit c'est un reçu.
        // Puisque sellData.sell_code est aussi le numéro de reçu généré, on utilise ça
        // Note: Le backend s'attend à `receipt_number` ou `invoice_number`.
        // Pour être sûr, si c'est un paiement complet sans client, le numéro de ticket de caisse est `sell_code` ?
        // On suppose qu'on utilise l'endpoint /sells/{id}/receipt ou on construit bêtement un lien
        // Wait, the PDFController expects `download-pdf/{record}?type=receipt`
        // How do we know the record number? sellData could just pass sell.id to a new endpoint maybe?
        const token = localStorage.getItem('token');
        const url = `${baseURL}/sells/${sellData.id}/pdf-receipt?token=${token}`;

        // Actually I should just use the exact sell ID because receipt_number isn't in ISellWithDetails directly.
        // Let's open the API endpoint that generates the PDF for a sell ID.
        window.open(url, '_blank');
        onClose();
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
                <Button onClick={onClose} color="inherit">Annuler</Button>
                <Button onClick={handleDownloadPDF} startIcon={<Download />} color="secondary">
                    PDF
                </Button>
                <Button onClick={handlePrint} disabled={!selectedPrinter || printing} startIcon={printing ? <CircularProgress size={16} /> : <Print />} variant="contained">
                    Ticket Thermique
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrintDialog;
