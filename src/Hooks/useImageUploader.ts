import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ImageUploader {
    uploadProgress: number;
    handleFileUpload: (files: FileList | null) => void;
    images: Array<string>;
    setImages: any
    setUploadProgress: any
}

const useImageUploader = (): ImageUploader => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [images, setImages] = useState<Array<string>>([]);

    const handleFileUpload = async (files: FileList | null): Promise<void> => {
        if (!files) return;

        const storage = getStorage();

        Array.from(files).forEach(async (file) => {
            console.log(file.name)
            const storageRef = ref(storage, `images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(progress);
            }, (error) => {
                console.log('Upload error:', error);
            }, async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImages((prev) => [...prev, downloadURL]);
            });
        });
    };

    return {
        uploadProgress,
        handleFileUpload,
        images,
        setImages,
        setUploadProgress
    };
};

export default useImageUploader;
