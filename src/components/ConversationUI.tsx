'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConversationBubble, ConversationOption, ConversationFlow } from './ConversationElements';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  text: string;
  speaker: 'adeline' | 'student';
}

const ConversationUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === '') return;

    const newMessage: Message = { id: messages.length + 1, text: input, speaker: 'student' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/adeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (response.ok) {
        const adelineResponse: Message = {
          id: messages.length + 2,
          text: data.message,
          speaker: 'adeline',
        };
        setMessages((prevMessages) => [...prevMessages, adelineResponse]);
      } else {
        const errorResponse: Message = {
          id: messages.length + 2,
          text: `Error: ${data.error || 'Something went wrong'}`,
          speaker: 'adeline',
        };
        setMessages((prevMessages) => [...prevMessages, errorResponse]);
      }
    } catch (error) {
      const errorResponse: Message = {
        id: messages.length + 2,
        text: 'Error: Could not connect to the server.',
        speaker: 'adeline',
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex-1 overflow-y-auto p-4">
        <ConversationFlow>
          {messages.map((msg) => (
            <ConversationBubble key={msg.id} speaker={msg.speaker}>
              {msg.text}
            </ConversationBubble>
          ))}
          {loading && (
            <ConversationBubble speaker="adeline">
              Adeline is thinking...
            </ConversationBubble>
          )}
        </ConversationFlow>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-light"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark focus:outline-none focus:ring-2 focus:ring-purple-light"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConversationUI;