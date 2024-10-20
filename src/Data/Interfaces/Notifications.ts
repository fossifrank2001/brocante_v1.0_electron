import { ReactNode } from 'react';

export interface INotification{
    id: number;
    type: number;
    data?: null | IData;
    read_at: string;
    created_at: string

}

type Tnature = 'info' | 'success' | 'warning' | 'error'

interface IData{
    id: number
    title: string
    role_code: string
    nature: Tnature
    message: string
    item: string
}

export interface INotificationTableData extends Omit<INotification, 'type'> {
    type: Tnature;
    status: string;
    actions: ReactNode;
}