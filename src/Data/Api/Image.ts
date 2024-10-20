import axiosInstance, { IApiResponseBase } from 'Data/Utilities/axiosInstance';
import {IImage} from "Data/Interfaces/Image.ts";

interface IImagePayload {
    path: File;
    imageable_type: string;
    imageable_id: number;
}

class ImageAPI {
    static async toggle(payload: IImagePayload): Promise<IApiResponseBase<IImage>> {
        try {
            const formData = new FormData();
            formData.append('path', payload.path);
            formData.append('imageable_type', payload.imageable_type);
            formData.append('imageable_id', payload.imageable_id.toString());

            const response = await axiosInstance.post<IApiResponseBase<IImage>>(`/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    static async delete(image: string): Promise<IApiResponseBase<null>> {
        try {
            const response = await axiosInstance.delete<IApiResponseBase<null>>(`/image/${image}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
}

export default ImageAPI;
