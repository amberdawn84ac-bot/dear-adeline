import React from 'react';

interface VoiceChatProps {
    userId: string;
    onMessage: (message: string) => void;
    onResponse?: (text: string) => void;
    autoSpeak?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = () => {
    return (
        <div className="p-4 bg-gray-100 rounded text-center text-sm text-gray-500">
            Voice Chat is currently under maintenance.
        </div>
    );
};

export default VoiceChat;
