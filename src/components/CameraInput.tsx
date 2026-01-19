'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Check } from 'lucide-react';

interface CameraInputProps {
    onClose: () => void;
    onPictureTaken: (imageData: string) => void;
}

export function CameraInput({ onClose, onPictureTaken }: CameraInputProps) {
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setError(null);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            setError("Failed to access camera. Please make sure camera permissions are enabled for this site.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageData = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageData);
                stopCamera();
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onPictureTaken(capturedImage);
            onClose();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
                <div className="p-6 border-b border-[var(--cream-dark)] flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[var(--forest)] serif">Camera Input</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--cream)] rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {error && (
                        <div className="w-full bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                </div>
                <div className="p-6 border-t border-[var(--cream-dark)] flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <button onClick={handleRetake} className="px-8 py-4 rounded-2xl font-bold transition-all shadow-lg bg-gray-200 text-gray-800 hover:bg-gray-300">
                                Retake
                            </button>
                            <button onClick={handleConfirm} className="px-8 py-4 rounded-2xl font-bold transition-all shadow-lg bg-green-500 text-white hover:bg-green-600 flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Use Picture
                            </button>
                        </>
                    ) : (
                        <button onClick={takePicture} disabled={!!error} className="px-8 py-4 rounded-2xl font-bold transition-all shadow-lg bg-[var(--forest)] text-white hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Take Picture
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
