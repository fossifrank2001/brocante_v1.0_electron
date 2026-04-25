export interface ActivityLog {
    id: string;
    created_at: string;
    userId?: number;
    customerId?: number;
    sellCode?: string;
    type: ActivityType;
    action: ActivityAction;
    description: string;
    metadata?: Record<string, any>;
    previousState?: Record<string, any>;
    newState?: Record<string, any>;
    status?: ActivityStatus;
    amount?: number;
    paymentMethod?: string;
    transactionType?: string;
}

export enum ActivityType {
    SALE = 'sale',
    PAYMENT = 'payment',
    INVOICE = 'invoice',
    DEBT_RECOVERY = 'debt_recovery',
    CUSTOMER = 'customer',
    PRODUCT = 'product',
    REFUND = 'refund',
    ADJUSTMENT = 'adjustment'
}

export enum ActivityAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    PAY = 'pay',
    RECOVER = 'recover',
    CANCEL = 'cancel',
    REFUND = 'refund',
    ADJUST = 'adjust'
}

export enum ActivityStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    PARTIAL = 'partial'
}

export interface ActivityLogFilters {
    startDate?: string;
    endDate?: string;
    userId?: number;
    customerId?: number;
    sellCode?: string;
    type?: ActivityType;
    action?: ActivityAction;
    status?: ActivityStatus;
    search?: string;
}

export interface ActivityLogSummary {
    totalLogs: number;
    totalAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    typeDistribution: Record<ActivityType, number>;
    statusDistribution: Record<ActivityStatus, number>;
    dailyStats: Array<{
        date: string;
        count: number;
        amount: number;
    }>;
}

export interface StateTransition {
    from: string;
    to: string;
    timestamp: string;
    action: ActivityAction;
    actor: string;
    metadata?: Record<string, any>;
}

export interface EntityState {
    entityType: string;
    entityId: string;
    currentState: string;
    transitions: StateTransition[];
    lastUpdated: string;
}
