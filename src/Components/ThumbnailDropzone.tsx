import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ThumbnailDropzone = ({ onDrop }) => {
    const [preview, setPreview] = useState(null);
    const [imageSize, setImageSize] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDropAccepted = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        setImageSize((file.size / 1024).toFixed(2)); // taille en Ko
        setUploadProgress(0); // Réinitialiser la progression à 0 avant un nouveau téléchargement
        onDrop(file, setUploadProgress);
    }, [onDrop]);

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
                        </div>
                    </div>

                    <p className="fs-2 text-center mb-0">
                        Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted.
                    </p>
                    {preview && (
                        <>
                            <img src={preview} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />
                            <p>Image size: {imageSize} KB</p>
                        </>
                    )}
                    <div className="progress" style={{ height: '20px', marginTop: '10px' }}>
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
                </div>
            </div>
    );
};

export default ThumbnailDropzone;
