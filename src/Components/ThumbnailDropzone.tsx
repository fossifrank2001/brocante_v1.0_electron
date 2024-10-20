import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ImageAPI from 'Data/Api/Image.ts';
import {IImage} from "Data/Interfaces/Image.ts";
import Toast from "Data/Utilities/Toast.ts";


interface IThumbnailDropzoneProps {
    onUploadSuccess: (image: IImage) => void;
    existingImageUrl?: string;
    existingImageId?:number;
    imageable?: Pick<IImage, 'imageable_type'|'imageable_id'>;
}

const ThumbnailDropzone: React.FC<IThumbnailDropzoneProps> = ({
                                                                  onUploadSuccess,
                                                                  existingImageUrl,
                                                                  existingImageId,
                                                                  imageable
}) => {
    const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const onDropAccepted = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await ImageAPI.toggle({
                path: file,
                imageable_type: imageable.imageable_type,
                imageable_id: imageable.imageable_id
            });
            if (response && response.data) {
                Toast.success(response.message)
                onUploadSuccess(response.data);
            }
        } catch (error) {
            console.error('Error during image upload:', error);
        }
    }, [onUploadSuccess]);

    const handleDeleteImage = useCallback(async () => {
        if (existingImageId) {
            try {
                const result = await ImageAPI.delete(existingImageId.toString());

                Toast.success(result.message)
                setPreview(null);
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    }, [existingImageId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDropAccepted,
        accept: {
            'image/jpeg': [],
            'image/png': []
        },
        maxFiles: 1
    });

    return (
        <div className="card">
            <div className="card-body">
                <h4 className="card-title mb-7">Thumbnail</h4>
                <div {...getRootProps()} className="dropzone dz-clickable mb-2">
                    <input {...getInputProps()} />
                    <div className="dz-default dz-message">
                        <button className="dz-button" type="button">
                            {isDragActive ? 'Drop the file here ...' : 'Drop Thumbnail here to upload or click to select'}
                        </button>
                        {preview && (
                            <>
                                <img src={preview} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />
                                <div className="progress" style={{ height: '10px', marginTop: '2px' }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${uploadProgress}%` }}
                                        aria-valuenow={uploadProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        {uploadProgress}%
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={handleDeleteImage}
                                >
                                    Remove Image
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThumbnailDropzone;
