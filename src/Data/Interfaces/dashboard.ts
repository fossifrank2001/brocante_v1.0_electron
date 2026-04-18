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
    low_stock?: number;
    out_of_stock?: number;
}

export interface DashboardChartsStats {
    sales_overview: {
        days: string[];
        amounts: number[];
        start_date: string;
        end_date: string;
    };
    revenue_distribution: {
        labels: string[];
        amounts: number[];
        start_date: string;
        end_date: string;
    };
}

export interface DashboardResponse {
    success: boolean;
    data: AccountStats | SaleStats | ProductStats | DashboardChartsStats;
}

export interface IDashboardItem {
    count: number;
    amount: number;
}