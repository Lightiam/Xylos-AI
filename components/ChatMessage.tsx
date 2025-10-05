import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isSelf = message.isSelf;
  return (
    <div className={`flex flex-col mb-4 ${isSelf ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${isSelf ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
        {!isSelf && (
          <p className="text-xs font-bold text-indigo-300 mb-1">{message.senderName}</p>
        )}
        <p className="text-sm">{message.text}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
    </div>
  );
};

export default ChatMessage;
