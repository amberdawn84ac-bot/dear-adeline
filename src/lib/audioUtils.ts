/**
 * Audio utility functions for PCM processing and audio buffer management
 * Used for Gemini native audio streaming
 */

/**
 * Convert Float32Array PCM data to a Blob
 */
export function createPcmBlob(float32Array: Float32Array): Blob {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return new Blob([int16Array.buffer], { type: 'audio/pcm' });
}

/**
 * Decode base64 audio data to AudioBuffer
 */
export async function decodeAudioData(
    uint8Array: Uint8Array,
    audioContext: AudioContext,
    sampleRate: number,
    numberOfChannels: number
): Promise<AudioBuffer> {
    const int16Array = new Int16Array(uint8Array.buffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
    }

    const audioBuffer = audioContext.createBuffer(
        numberOfChannels,
        float32Array.length / numberOfChannels,
        sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] = float32Array[i * numberOfChannels + channel];
        }
    }

    return audioBuffer;
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
