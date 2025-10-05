import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon } from './icons';

interface ChatSidebarProps {
  messages: ChatMessageType[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ messages, onSendMessage, isOpen }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className={`flex flex-col bg-gray-900 h-full transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold">Chat</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-transparent"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={!newMessage.trim()}
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  );
};

export default ChatSidebar;
