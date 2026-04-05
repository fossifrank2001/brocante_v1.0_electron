"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
    Upload, Science, CheckCircle, Error as ErrorIcon,
    FolderOpen, AutoAwesome
} from "@mui/icons-material"

const ipc = (window as any).ipcRenderer;

type ImportMode = null | 'import' | 'demo' | 'empty';
type Status = 'idle' | 'processing' | 'success' | 'error';

const DatabaseImport: React.FC = () => {
    const [mode, setMode] = useState<ImportMode>(null)
    const [status, setStatus] = useState<Status>("idle")
    const [message, setMessage] = useState("")

    const handleImportFile = async () => {
        if (!ipc?.dbImport) {
            setMessage("L'import de fichier nécessite le mode Electron.");
            setStatus("error");
            return;
        }
        setStatus("processing");
        setMessage("Import en cours...");
        try {
            const result = await ipc.dbImport();
            if (result?.success) {
                setStatus("success");
                setMessage("Base de données importée avec succès !");
            } else if (result?.error === 'Annulé') {
                setStatus("idle");
                setMessage("");
            } else {
                setStatus("error");
                setMessage(result?.error || "Erreur lors de l'import");
            }
        } catch (e: any) {
            setStatus("error");
            setMessage(e?.message || "Erreur inattendue");
        }
    }

    const handleLoadDemo = async () => {
        if (!ipc?.dbSeedDemo) {
            setMessage("Le chargement démo nécessite le mode Electron.");
            setStatus("error");
            return;
        }
        setStatus("processing");
        setMessage("Chargement des données de démonstration...");
        try {
            const result = await ipc.dbSeedDemo();
            if (result?.success) {
                setStatus("success");
                setMessage("Données de démonstration chargées ! 35 produits, 8 clients, 5 fournisseurs.");
            } else {
                setStatus("error");
                setMessage("Erreur lors du chargement des données démo");
            }
        } catch (e: any) {
            setStatus("error");
            setMessage(e?.message || "Erreur inattendue");
        }
    }

    const cardStyle = (isSelected: boolean, accent: string): React.CSSProperties => ({
        padding: "20px",
        borderRadius: 18,
        border: isSelected ? `2.5px solid ${accent}` : "2px solid #e2e8f0",
        background: isSelected ? `${accent}08` : "white",
        cursor: "pointer",
        transition: "all 0.25s",
        textAlign: "left" as const,
    })

    const iconBoxStyle = (bg: string): React.CSSProperties => ({
        width: 44, height: 44, borderRadius: 14,
        background: bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        marginBottom: 12,
    })

    if (status === "success") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                }}>
                    <CheckCircle style={{ color: "white", fontSize: 32 }} />
                </div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 8, fontSize: "1.1rem" }}>
                    Configuration terminée !
                </h3>
                <p style={{ color: "#64748b", fontWeight: 500, fontSize: "0.9rem", margin: 0 }}>
                    {message}
                </p>
            </motion.div>
        )
    }

    if (status === "processing") {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "24px 0" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: 48, height: 48, borderRadius: "50%",
                        border: "4px solid #e2e8f0", borderTopColor: "#4f46e5",
                        margin: "0 auto 16px",
                    }}
                />
                <p style={{ color: "#64748b", fontWeight: 600, margin: 0 }}>{message}</p>
            </motion.div>
        )
    }

    if (status === "error") {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: "#fef2f2", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px",
                }}>
                    <ErrorIcon style={{ color: "#ef4444", fontSize: 28 }} />
                </div>
                <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "0.9rem", marginBottom: 12 }}>
                    {message}
                </p>
                <button onClick={() => { setStatus("idle"); setMode(null); }}
                    style={{
                        background: "#f8fafc", border: "1.5px solid #e2e8f0",
                        borderRadius: 12, padding: "8px 20px", cursor: "pointer",
                        fontWeight: 700, fontSize: "0.85rem", color: "#475569",
                    }}>
                    Réessayer
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p style={{ color: "#475569", fontWeight: 600, fontSize: "0.9rem", marginBottom: 16 }}>
                Comment souhaitez-vous démarrer ?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Option 1: Import existing DB */}
                <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    style={cardStyle(mode === 'import', '#4f46e5')}
                    onClick={() => setMode('import')}
                >
                    <div style={iconBoxStyle("linear-gradient(135deg, #6366f1, #4338ca)")}>
                        <FolderOpen style={{ color: "white", fontSize: 22 }} />
                    </div>
                    <h4 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4, fontSize: "0.95rem" }}>
                        Importer une base existante
                    </h4>
                    <p style={{ color: "#64748b", fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
                        Sélectionnez un fichier .sqlite pour restaurer vos données précédentes.
                    </p>
                </motion.div>

                {/* Option 2: Load demo data */}
                <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    style={cardStyle(mode === 'demo', '#f59e0b')}
                    onClick={() => setMode('demo')}
                >
                    <div style={iconBoxStyle("linear-gradient(135deg, #f59e0b, #d97706)")}>
                        <Science style={{ color: "white", fontSize: 22 }} />
                    </div>
                    <h4 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4, fontSize: "0.95rem" }}>
                        Charger les données de démonstration
                    </h4>
                    <p style={{ color: "#64748b", fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
                        Explorez l'application avec 35 produits, 8 clients et 5 fournisseurs préchargés.
                    </p>
                </motion.div>

                {/* Option 3: Start fresh */}
                <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    style={cardStyle(mode === 'empty', '#10b981')}
                    onClick={() => setMode('empty')}
                >
                    <div style={iconBoxStyle("linear-gradient(135deg, #10b981, #059669)")}>
                        <AutoAwesome style={{ color: "white", fontSize: 22 }} />
                    </div>
                    <h4 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4, fontSize: "0.95rem" }}>
                        Commencer à zéro
                    </h4>
                    <p style={{ color: "#64748b", fontSize: "0.82rem", fontWeight: 500, margin: 0 }}>
                        Démarrez avec une base vierge et ajoutez vos données au fur et à mesure.
                    </p>
                </motion.div>
            </div>

            {/* Action button when a mode is selected */}
            {mode && mode !== 'empty' && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={mode === 'import' ? handleImportFile : handleLoadDemo}
                    style={{
                        width: "100%", marginTop: 16, padding: "14px",
                        borderRadius: 14, border: "none",
                        background: mode === 'import'
                            ? "linear-gradient(135deg, #6366f1, #4338ca)"
                            : "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "white", fontWeight: 800, fontSize: "0.95rem",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
                        boxShadow: "0 8px 20px -4px rgba(0,0,0,0.2)",
                    }}
                >
                    {mode === 'import' ? (
                        <>
                            <Upload style={{ fontSize: 20 }} /> Sélectionner un fichier
                        </>
                    ) : (
                        <>
                            <Science style={{ fontSize: 20 }} /> Charger les données démo
                        </>
                    )}
                </motion.button>
            )}
        </motion.div>
    )
}

export default DatabaseImport
