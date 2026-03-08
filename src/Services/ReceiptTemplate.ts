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
        const date = new Date(sell.created_at).toLocaleString('fr-FR');

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
            font-family: 'Courier New', monospace; 
            font-size: 10px;
            padding: 2mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 2mm 0; }
        .header { font-size: 12px; margin-bottom: 3mm; }
        .item { display: flex; justify-content: space-between; margin: 1mm 0; }
        .total { font-size: 11px; margin-top: 2mm; }
    </style>
</head>
<body>
    <div class="center header bold">${storeName}</div>
    ${storeAddress ? `<div class="center">${storeAddress}</div>` : ''}
    ${storePhone ? `<div class="center">${storePhone}</div>` : ''}
    <div class="line"></div>
    <div class="center">TICKET N° ${sell.sell_code}</div>
    <div class="center">${date}</div>
    <div>Caissier: ${cashierName}</div>
    <div class="line"></div>
    ${sell.sell_items.map(item => `
    <div class="item">
        <span>${item.product?.name || 'Produit'}</span>
    </div>
    <div class="item">
        <span>${item.quantity}x ${UtilMethods.formatNumber(item.price)}</span>
        <span>${UtilMethods.formatNumber(item.total_unit)}</span>
    </div>
    `).join('') || ''}
    <div class="line"></div>
    <div class="item total bold">
        <span>TOTAL</span>
        <span>${UtilMethods.formatNumber(sell.total_amount)}</span>
    </div>
    <div class="item">
        <span>Payé</span>
        <span>${UtilMethods.formatNumber(sell.amount_paid)}</span>
    </div>
    ${sell.remaining_balance > 0 ? `
    <div class="item">
        <span>Reste</span>
        <span>${UtilMethods.formatNumber(sell.remaining_balance)}</span>
    </div>
    ` : ''}
    <div class="line"></div>
    <div class="center">Merci de votre visite!</div>
</body>
</html>
        `.trim();
    }

    static generate80mm(data: ReceiptData): string {
        return this.generate58mm(data).replace('58mm', '80mm').replace('font-size: 10px', 'font-size: 11px');
    }
}

export default ReceiptTemplate;
