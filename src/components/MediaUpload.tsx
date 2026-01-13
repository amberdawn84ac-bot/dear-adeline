'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Loader2 } from 'lucide-react';

interface MediaUploadProps {
    onUploadComplete: (urls: string[]) => void;
    maxFiles?: number;
    acceptedTypes?: string;
    existingUrls?: string[];
}

export default function MediaUpload({
    onUploadComplete,
    maxFiles = 5,
    acceptedTypes = 'image/*,video/*',
    existingUrls = []
}: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; type: string; name: string }>>(
        existingUrls.map(url => ({
            url,
            type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video',
            name: url.split('/').pop() || 'file'
        }))
    );
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (uploadedFiles.length + files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/upload/media', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            const newFiles = data.urls.map((url: string, idx: number) => ({
                url,
                type: files[idx].type.startsWith('image/') ? 'image' : 'video',
                name: files[idx].name
            }));

            const updatedFiles = [...uploadedFiles, ...newFiles];
            setUploadedFiles(updatedFiles);
            onUploadComplete(updatedFiles.map(f => f.url));

        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(updatedFiles);
        onUploadComplete(updatedFiles.map(f => f.url));
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'image':
                return <Image className="w-5 h-5" />;
            case 'video':
                return <Video className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    onChange={handleFileSelect}
                    disabled={uploading || uploadedFiles.length >= maxFiles}
                    className="hidden"
                    id="media-upload"
                />
                <label
                    htmlFor="media-upload"
                    className={`cursor-pointer ${uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                                Click to upload photos or videos
                            </p>
                            <p className="text-xs text-gray-500">
                                {uploadedFiles.length} / {maxFiles} files
                            </p>
                        </div>
                    )}
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                            >
                                <div className="text-purple-600">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    {file.type === 'image' && (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="mt-2 w-full h-32 object-cover rounded"
                                        />
                                    )}
                                    {file.type === 'video' && (
                                        <video
                                            src={file.url}
                                            className="mt-2 w-full h-32 object-cover rounded"
                                            controls
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
