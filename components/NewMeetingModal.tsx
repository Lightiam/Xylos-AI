import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon, CalendarIcon, ClockIcon, CloseIcon } from './icons';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMeeting: (details: { title: string; date?: string; time?: string }) => void;
}

const NewMeetingModal: React.FC<NewMeetingModalProps> = ({ isOpen, onClose, onCreateMeeting }) => {
  const [meetingLink, setMeetingLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const newRoomId = uuidv4();
      setMeetingLink(`${window.location.origin}/meet/${newRoomId}`);
      setIsCopied(false);
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSchedule = () => {
    if (meetingTitle.trim() && meetingDate && meetingTime) {
      onCreateMeeting({ title: meetingTitle.trim(), date: meetingDate, time: meetingTime });
    } else {
      alert('Please enter a title, date, and time to schedule a meeting.');
    }
  };
  
  const handleStartNow = () => {
    const title = meetingTitle.trim() || `Instant Meeting`;
    onCreateMeeting({ title });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-white relative transform transition-all duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Create New Meeting</h2>

        <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-between mb-6">
          <p className="text-sm font-mono truncate mr-4">{meetingLink}</p>
          <button onClick={handleCopyLink} className="flex items-center space-x-2 bg-indigo-600 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            <CopyIcon className="w-4 h-4" />
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <button 
          onClick={handleStartNow}
          className="w-full bg-green-600 text-white py-3 text-base font-semibold rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Start an Instant Meeting
        </button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-800 px-2 text-sm text-gray-400">Or schedule for later</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-300 mb-1">
              Meeting Title
            </label>
            <input 
              ref={titleInputRef}
              type="text" 
              id="meeting-title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., Q4 Planning Session"
            />
          </div>
          <div className="flex space-x-4">
             <div className="w-1/2">
                <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="date" 
                      id="meeting-date" 
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>
            <div className="w-1/2">
                <label htmlFor="meeting-time" className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="time" 
                      id="meeting-time" 
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSchedule}
          disabled={!meetingTitle.trim() || !meetingDate || !meetingTime}
          className="w-full mt-6 bg-indigo-600 text-white py-3 text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Schedule Meeting
        </button>
      </div>
    </div>
  );
};

export default NewMeetingModal;