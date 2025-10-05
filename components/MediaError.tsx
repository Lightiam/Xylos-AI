import React from 'react';
import { AlertTriangleIcon } from './icons';

interface MediaErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onBack: () => void;
}

const MediaError: React.FC<MediaErrorProps> = ({ errorMessage, onRetry, onBack }) => {
  return (
    <div className="h-screen w-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center font-sans p-4 text-center">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl shadow-xl border border-red-500/50">
        <div className="flex justify-center mb-4">
          <AlertTriangleIcon className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Media Access Error</h2>
        <p className="text-gray-300 mb-6">{errorMessage}</p>
        <div className="flex justify-center space-x-4">
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-6 py-2.5 text-base font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onRetry}
              className="bg-indigo-600 text-white px-6 py-2.5 text-base font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            >
              Retry
            </button>
        </div>
      </div>
    </div>
  );
};

export default MediaError;
