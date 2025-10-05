import React from 'react';
import { BlurIcon } from './icons';

interface VirtualBackgroundPanelProps {
  onSelect: (url: string | null) => void;
  onClose: () => void;
  activeBackgroundUrl: string | null;
}

const backgrounds = [
  { name: 'None', url: null },
  { name: 'Blur', url: 'blur' },
  { name: 'Office', url: 'https://images.unsplash.com/photo-1554224155-8d044b4a2533?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Cafe', url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1994&auto=format&fit=crop' },
  { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?q=80&w=1974&auto=format&fit=crop' },
];

const VirtualBackgroundPanel: React.FC<VirtualBackgroundPanelProps> = ({ onSelect, onClose, activeBackgroundUrl }) => {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl p-4">
        <p className="text-white text-center font-semibold mb-3">Choose Virtual Background</p>
        <div className="grid grid-cols-6 gap-2">
          {backgrounds.map(bg => (
            <button 
              key={bg.name} 
              onClick={() => onSelect(bg.url)} 
              className={`relative aspect-video rounded-md overflow-hidden focus:outline-none transition-transform transform hover:scale-105 ${
                activeBackgroundUrl === bg.url ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-500' : ''
              }`}
            >
              {bg.url === 'blur' ? (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <BlurIcon className="w-8 h-8 text-white opacity-80" />
                </div>
              ) : bg.url ? (
                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">None</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end justify-center">
                <span className="text-white text-[10px] font-medium p-0.5 bg-black bg-opacity-40 rounded-sm">{bg.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualBackgroundPanel;