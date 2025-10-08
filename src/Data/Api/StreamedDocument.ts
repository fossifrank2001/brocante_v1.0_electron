import axiosInstance from 'Data/Utilities/axiosInstance';
import {AxiosRequestConfig} from "axios";

export type RecordType = 'invoice' | 'receipt';
export type ActionType = 'open' | 'download';

class StreamedDocumentAPI {
    static async generate(type: RecordType, record: string | number, action: ActionType = 'open'): Promise<Blob> {
        const res = await axiosInstance.get(`/download-pdf/${record}?type=${type}`, {
            responseType: 'blob'
        } as AxiosRequestConfig);

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (action === 'open') {
            window.open(url, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_${record}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setTimeout(() => URL.revokeObjectURL(url), 100);

        return blob;
    }
}

export default StreamedDocumentAPI;