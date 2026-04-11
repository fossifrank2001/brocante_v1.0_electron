export interface ITemplateField {
    id?: number;
    product_template_id?: number;
    name: string;
    field_key: string;
    field_type: 'text' | 'number' | 'select' | 'boolean' | 'date';
    options?: string[] | null;
    unit?: string | null;
    is_required: boolean;
    placeholder?: string | null;
    default_value?: string | null;
    sort_order: number;
}

export interface IProductTemplate {
    id: number;
    name: string;
    description?: string | null;
    sub_category_id?: number | null;
    is_default: boolean;
    is_active: boolean;
    fields: ITemplateField[];
    sub_category?: {
        id: number;
        label: string;
        description?: string;
    } | null;
    created_at?: string;
    updated_at?: string;
}

export interface IProductTemplatePayload {
    name: string;
    description?: string | null;
    sub_category_id?: number | null;
    is_default?: boolean;
    fields: Omit<ITemplateField, 'id' | 'product_template_id'>[];
}
