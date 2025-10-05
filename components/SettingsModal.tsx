import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, UserIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { name: string, avatar: string }) => void;
  currentName: string;
  currentAvatar: string;
}

const avatars = [
  `https://robohash.org/user1.png?size=150x150&set=set4`,
  `https://robohash.org/user2.png?size=150x150&set=set4`,
  `https://robohash.org/user3.png?size=150x150&set=set4`,
  `https://robohash.org/user4.png?size=150x150&set=set4`,
  `https://robohash.org/user5.png?size=150x150&set=set4`,
];


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentName, currentAvatar }) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setSelectedAvatar(currentAvatar);
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentName, currentAvatar, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), avatar: selectedAvatar });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-white relative transform transition-all duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">User Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                ref={inputRef}
                type="text" 
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-3 text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Avatar
            </label>
            <div className="flex justify-center space-x-3">
              {avatars.map((avatarUrl) => (
                <button
                  key={avatarUrl}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`w-16 h-16 rounded-full overflow-hidden transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                    selectedAvatar === avatarUrl ? 'ring-4 ring-indigo-500 p-1 bg-indigo-500' : 'ring-2 ring-transparent hover:ring-gray-500'
                  }`}
                >
                  <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={!name.trim() || (name.trim() === currentName && selectedAvatar === currentAvatar)}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;