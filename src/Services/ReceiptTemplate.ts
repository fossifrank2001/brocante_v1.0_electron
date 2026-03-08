import UtilMethods from '@/Data/Utilities/UtilMethods';

export interface ISellItem {
    id: number;
    product_id: number;
    price: number;
    quantity: number;
    total_unit: number;
    product?: {
        id: number;
        name: string;
    };
}

export interface ISellWithDetails {
    id: number;
    sell_code: string | number;
    total_amount: number;
    amount_paid: number;
    remaining_balance: number;
    created_at: string;
    sell_items: ISellItem[];
}

export interface ReceiptData {
    sell: ISellWithDetails;
    storeName: string;
    storeAddress?: string;
    storePhone?: string;
    cashierName: string;
    sessionId: number;
}

class ReceiptTemplate {
    static generate58mm(data: ReceiptData): string {
        const { sell, storeName, storeAddress, storePhone, cashierName } = data;
        const date = new Date(sell.created_at).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: 58mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            width: 58mm; 
            font-family: 'Courier New', Courier, monospace; 
            font-size: 11px;
            line-height: 1.2;
            padding: 3mm;
            color: #000;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 2mm 0; }
        .header { font-size: 14px; margin-bottom: 2mm; text-transform: uppercase; }
        .item-row { display: flex; justify-content: space-between; margin: 1mm 0; align-items: flex-start; }
        .item-name { flex: 1; padding-right: 2mm; overflow-wrap: break-word; }
        .item-details { text-align: right; white-space: nowrap; }
        .total-section { margin-top: 2mm; font-size: 12px; }
        .footer { margin-top: 5mm; font-size: 10px; }
    </style>
</head>
<body>
    <div class="center header bold">${storeName}</div>
    ${storeAddress ? `<div class="center">${storeAddress}</div>` : ''}
    ${storePhone ? `<div class="center">Tél: ${storePhone}</div>` : ''}
    
    <div class="line"></div>
    <div class="center bold">TICKET DE CAISSE</div>
    <div class="center">N° ${sell.sell_code}</div>
    <div class="center">${date}</div>
    <div style="margin-top: 1mm">Caissier: ${cashierName}</div>
    <div class="line"></div>

    <div class="bold" style="margin-bottom: 1mm">Détails Articles</div>
    ${sell.sell_items.map(item => `
        <div class="item-name">${item.product?.name || 'Produit'}</div>
        <div class="item-row">
            <span style="font-size: 10px">${item.quantity} x ${UtilMethods.formatNumber(item.price)}</span>
            <span class="bold">${UtilMethods.formatNumber(item.total_unit)}</span>
        </div>
    `).join('')}

    <div class="line"></div>

    <div class="item-row total-section bold">
        <span>TOTAL TTC</span>
        <span>${UtilMethods.formatNumber(sell.total_amount)} XAF</span>
    </div>
    
    <div class="item-row">
        <span>Montant Reçu</span>
        <span>${UtilMethods.formatNumber(sell.amount_paid)}</span>
    </div>

    ${sell.remaining_balance > 0 ? `
    <div class="item-row bold" style="color: #000;">
        <span>RESTE À PAYER</span>
        <span>${UtilMethods.formatNumber(sell.remaining_balance)}</span>
    </div>
    ` : `
    <div class="item-row">
        <span>Monnaie</span>
        <span>${UtilMethods.formatNumber(Math.max(0, sell.amount_paid - sell.total_amount))}</span>
    </div>
    `}

    <div class="line"></div>
    <div class="center footer">
        <div class="bold">MERCI DE VOTRE VISITE !</div>
        <div>À bientôt chez ${storeName}</div>
        <div style="font-size: 8px; margin-top: 2mm;">Logiciel de gestion v1.0</div>
    </div>
</body>
</html>
        `.trim();
    }

    static generate80mm(data: ReceiptData): string {
        return this.generate58mm(data)
            .replace('58mm', '80mm')
            .replace('font-size: 11px', 'font-size: 13px')
            .replace('font-size: 14px', 'font-size: 16px')
            .replace('font-size: 10px', 'font-size: 12px');
    }
}

export default ReceiptTemplate;
