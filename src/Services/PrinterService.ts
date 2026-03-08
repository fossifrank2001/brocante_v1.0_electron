/**
 * PrinterService - Communication IPC avec Electron pour impression thermique
 */

export interface PrinterInfo {
    name: string;
    displayName: string;
    description: string;
    status: number;
    isDefault: boolean;
}

export interface PrintResult {
    success: boolean;
    error?: string;
    message?: string;
}

class PrinterService {
    private static checkElectron(): boolean {
        return typeof window !== 'undefined' && 'ipcRenderer' in window;
    }

    /**
     * Récupère la liste des imprimantes disponibles
     */
    static async getPrinters(): Promise<PrinterInfo[]> {
        try {
            if (!this.checkElectron()) {
                console.warn('IPC not available - running in web mode');
                return [];
            }

            const result = await (window as any).ipcRenderer.invoke('get-printers');
            if (result.success) {
                return result.printers;
            }
            throw new Error(result.error || 'Failed to get printers');
        } catch (error) {
            console.error('Error getting printers:', error);
            return [];
        }
    }

    /**
     * Imprime un ticket HTML via l'imprimante spécifiée
     */
    static async printHTML(printerName: string, htmlContent: string): Promise<PrintResult> {
        try {
            if (!this.checkElectron()) {
                console.warn('IPC not available - opening print dialog instead');
                // Fallback: ouvrir la boîte de dialogue d'impression du navigateur
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.print();
                }
                return { success: true };
            }

            const result = await (window as any).ipcRenderer.invoke('print-thermal', {
                printerName,
            });

            return result;
        } catch (error: any) {
            console.error('Error printing:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Imprime des données ESC/POS brutes (nécessite configuration supplémentaire)
     */
    static async printRawESCPOS(printerName: string, escposData: Uint8Array): Promise<PrintResult> {
        try {
            if (!this.checkElectron()) {
                console.warn('Raw ESC/POS printing not available in web mode');
                return { success: false, error: 'ESC/POS printing requires Electron' };
            }

            const result = await (window as any).ipcRenderer.invoke('print-thermal-raw', {
                printerName,
                escposData,
            });

            return result;
        } catch (error: any) {
            console.error('Error printing raw ESC/POS:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Récupère l'imprimante par défaut
     */
    static async getDefaultPrinter(): Promise<PrinterInfo | null> {
        const printers = await this.getPrinters();
        return printers.find(p => p.isDefault) || printers[0] || null;
    }
}

export default PrinterService;
