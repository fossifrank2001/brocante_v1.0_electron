export * from './Access.ts'
export * from './Category.ts'
export * from './Habilitation.ts'
export * from './Menu.ts'
export * from './Notifications.ts'
export * from './Permission.ts'
export * from './Person.ts'
export * from './Product.ts'
export * from './ProductTemplate.ts'
export * from './Role.ts'
export * from './Supply.ts'
export * from './Invoice.ts'
export * from './Image.ts'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export * from './User.ts'
export * from './Users.ts'

export interface ILink {
    url: string | null; 
    label: string;
    active: boolean;
}

export interface IPaginationData {
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: ILink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}


export interface IAppContext {
    togglePageLoading: (state?: boolean) => void;
}