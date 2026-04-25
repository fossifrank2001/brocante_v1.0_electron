import { ActivityLog, ActivityLogFilters, ActivityType, ActivityAction, ActivityStatus } from '@/Data/Interfaces/ActivityLog';
import { IPerson } from '@/Data/Interfaces/Person';
import { CartItem } from '@/Data/Slices/dashboard/seller/cartSlice';
import ActivityLogAPI from '@/Data/Api/ActivityLog';

class ActivityLogService {
    private static instance: ActivityLogService;

    private constructor() {}

    static getInstance(): ActivityLogService {
        if (!ActivityLogService.instance) {
            ActivityLogService.instance = new ActivityLogService();
        }
        return ActivityLogService.instance;
    }

    // ─── Méthodes de création (fire-and-forget vers l'API) ───────────────────

    logSale(sellCode: string, customer: IPerson, cart: CartItem[], totalPrice: number, paymentData: any): void {
        const customerName = customer ? `${customer.lastname || ''} ${customer.firstname || ''}`.trim() : 'Inconnu';
        ActivityLogAPI.create({
            type: ActivityType.SALE,
            action: ActivityAction.CREATE,
            sellCode,
            customerId: customer?.id,
            description: `Vente ${sellCode || 'UNKNOWN'} - Client: ${customerName}`,
            amount: totalPrice,
            paymentMethod: paymentData.payment_mode,
            transactionType: paymentData.transaction_type,
            metadata: {
                cartItems: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    subtotal: item.subtotal,
                })),
                customerInfo: customer ? {
                    id: customer.id,
                    name: customerName,
                    phone: customer.phone,
                } : null,
            },
            previousState: customer ? {
                customerBalance: customer.company_balance,
                customerDebts: customer.remaining_balance,
            } : null,
        }).catch(err => console.error('[ActivityLog] logSale failed:', err));
    }

    logPayment(sellCode: string, customer: IPerson, amount: number, paymentMethod: string, transactionType: string): void {
        const customerName = customer ? `${customer.lastname || ''} ${customer.firstname || ''}`.trim() : 'Inconnu';
        ActivityLogAPI.create({
            type: ActivityType.PAYMENT,
            action: ActivityAction.PAY,
            sellCode,
            customerId: customer?.id,
            description: `Paiement ${sellCode}`,
            amount,
            paymentMethod,
            transactionType,
            metadata: {
                paymentMethod,
                transactionType,
                customerInfo: customer ? { id: customer.id, name: customerName } : null,
            },
        }).catch(err => console.error('[ActivityLog] logPayment failed:', err));
    }

    logDebtRecovery(customer: IPerson, recoveredAmount: number, method: 'excess' | 'balance' | 'both'): void {
        const customerName = customer ? `${customer.lastname || ''} ${customer.firstname || ''}`.trim() : 'Inconnu';
        ActivityLogAPI.create({
            type: ActivityType.DEBT_RECOVERY,
            action: ActivityAction.RECOVER,
            customerId: customer?.id,
            description: `Recouvrement dette - Client: ${customerName}`,
            amount: recoveredAmount,
            metadata: {
                method,
                customerInfo: customer ? {
                    id: customer.id,
                    name: customerName,
                    previousBalance: customer.company_balance,
                    previousDebts: customer.remaining_balance,
                } : null,
            },
        }).catch(err => console.error('[ActivityLog] logDebtRecovery failed:', err));
    }

    logInvoicePayment(invoiceId: string, customerId: number, amount: number, status: string): void {
        ActivityLogAPI.create({
            type: ActivityType.INVOICE,
            action: ActivityAction.PAY,
            customerId,
            description: `Paiement facture ${invoiceId} - ${status}`,
            amount,
            metadata: { invoiceId, status },
        }).catch(err => console.error('[ActivityLog] logInvoicePayment failed:', err));
    }

    logCancellation(sellCode: string, reason: string, amount?: number): void {
        ActivityLogAPI.create({
            type: ActivityType.SALE,
            action: ActivityAction.CANCEL,
            sellCode,
            description: `Annulation vente ${sellCode} - ${reason}`,
            amount,
            status: ActivityStatus.CANCELLED,
            metadata: { reason },
        }).catch(err => console.error('[ActivityLog] logCancellation failed:', err));
    }

    logRefund(sellCode: string, customerId: number, amount: number, reason: string): void {
        ActivityLogAPI.create({
            type: ActivityType.REFUND,
            action: ActivityAction.REFUND,
            sellCode,
            customerId,
            description: `Remboursement ${sellCode} - ${reason}`,
            amount,
            metadata: { reason },
        }).catch(err => console.error('[ActivityLog] logRefund failed:', err));
    }

    // ─── Lecture (async) ─────────────────────────────────────────────────────

    async getLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
        try {
            const response = await ActivityLogAPI.list(filters);
            return response.data.data as ActivityLog[];
        } catch (err) {
            console.error('[ActivityLog] getLogs failed:', err);
            return [];
        }
    }

    async getSummary(filters?: ActivityLogFilters): Promise<any> {
        try {
            const response = await ActivityLogAPI.summary(filters);
            return response.data;
        } catch (err) {
            console.error('[ActivityLog] getSummary failed:', err);
            return null;
        }
    }

    async generateStateDiagram(entityType: 'sale' | 'customer', entityId: string): Promise<string> {
        try {
            const response = await ActivityLogAPI.entityTransitions(entityType, entityId);
            const { transitions, current_state } = response.data;

            if (!transitions || transitions.length === 0) {
                return 'Aucune transition trouvée';
            }

            let diagram = `stateDiagram-v2\n`;
            diagram += `    [*] --> ${transitions[0].from}\n`;
            transitions.forEach((t: any) => {
                diagram += `    ${t.from} --> ${t.to}: ${t.action}\n`;
            });
            diagram += `    ${current_state} --> [*]\n`;
            return diagram;
        } catch (err) {
            console.error('[ActivityLog] generateStateDiagram failed:', err);
            return 'Erreur lors de la génération du diagramme';
        }
    }
}

export default ActivityLogService;
