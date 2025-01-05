export interface AccountStats {
    accounts: {
        total: number;
        status: {
            active: number;
            inactive: number;
        };
    };
}

export interface SaleStats {
    sales: {
        total: IDashboardItem;
        status: {
            [key: string]: IDashboardItem;
        };
    };
}

export interface ProductStats {
    total: number;
    status: {
        [key: string]: number;
    };
}

export interface DashboardResponse {
    success: boolean;
    data: AccountStats | SaleStats | ProductStats;
}

export interface IDashboardItem {
    count: number;
    amount: number;
}