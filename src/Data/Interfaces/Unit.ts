export interface IUnit {
    id: number;
    name: string;
    abbreviation: string;
    type: 'piece' | 'weight' | 'length' | 'volume';
    allows_decimal: boolean;
    created_at?: string;
    updated_at?: string;
}
