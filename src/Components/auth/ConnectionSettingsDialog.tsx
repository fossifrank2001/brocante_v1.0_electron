import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { SettingsInputAntenna } from '@mui/icons-material';

interface Props {
    open: boolean;
    onClose: () => void;
}

const ConnectionSettingsDialog: React.FC<Props> = ({ open, onClose }) => {
    // Determine the initial value based on what's in local storage, or the fallback
    const [url, setUrl] = useState<string>(() => {
        return localStorage.getItem('API_BASE_URL') || "http://brocante.local/api/v1";
    });

    const handleSave = () => {
        if (!url.trim()) return;
        localStorage.setItem('API_BASE_URL', url.trim());
        // Forcing a full page reload so that Axios and other singletons pick up the new URL
        window.location.reload();
    };

    const handleReset = () => {
        setUrl("http://brocante.local/api/v1");
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                <SettingsInputAntenna color="primary" />
                Configuration Réseau (API)
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                        Si vous hébergez le système sur un réseau local ou sur internet, renseignez 
                        l'adresse de l'API ici (ex: <code>http://192.168.1.100:8000/api/v1</code>).
                    </Typography>
                    <TextField
                        fullWidth
                        label="Adresse de l'API Principale"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        variant="outlined"
                        placeholder="http://votre-serveur/api/v1"
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleReset} sx={{ color: '#ef4444', mr: 'auto', fontWeight: 600 }}>Réinitialiser</Button>
                <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Annuler</Button>
                <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#4f46e5', fontWeight: 700, borderRadius: '8px' }}>
                    Enregistrer et Redémarrer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConnectionSettingsDialog;
