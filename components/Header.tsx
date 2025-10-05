import React, { useState } from 'react';
import { SpinnerIcon, SettingsIcon, CalendarIcon } from './icons';
import IconButton from './IconButton';

interface HeaderProps {
  onNewMeeting: () => void;
  onOpenSettings: () => void;
  meetingDetails: { title: string; date?: string; time?: string } | null;
}

const Header: React.FC<HeaderProps> = ({ onNewMeeting, onOpenSettings, meetingDetails }) => {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = () => {
    if (roomId.trim() && !isJoining) {
      setIsJoining(true);
      console.log(`Joining room: ${roomId}`);
      // Simulate network request for joining a room
      setTimeout(() => {
        alert(`Successfully joined room: ${roomId}`);
        setIsJoining(false);
      }, 2000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJoinRoom();
    }
  };

  const isScheduled = meetingDetails?.date && meetingDetails?.time;
  const formattedDate = meetingDetails?.date ? new Date(meetingDetails.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';


  return (
    <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center z-10">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold text-white">Xylos AI</h1>
        {meetingDetails?.title ? (
            <div className="bg-gray-700 text-gray-300 text-sm font-semibold px-3 py-1 rounded-full flex items-center space-x-2" title={meetingDetails.title}>
              {isScheduled && <CalendarIcon className="w-4 h-4 text-gray-400" />}
              <span className="truncate max-w-xs">{meetingDetails.title}</span>
              {isScheduled && <span className="text-xs text-gray-400 whitespace-nowrap">{formattedDate} at {meetingDetails.time}</span>}
            </div>
        ) : (
            <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">In progress</span>
        )}
        <span className="text-gray-400">00:12:45</span>
      </div>
      <div className="flex items-center space-x-2">
         <IconButton onClick={onOpenSettings} variant="default" tooltip="Settings">
            <SettingsIcon className="w-5 h-5" />
         </IconButton>
         <button
          onClick={onNewMeeting}
          className="bg-green-600 text-white px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
        >
          New Meeting
        </button>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Room ID"
          className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-48 p-1.5 transition-all duration-300"
          aria-label="Room ID"
          disabled={isJoining}
        />
        <button
          onClick={handleJoinRoom}
          className="bg-indigo-600 text-white px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center w-[110px]"
          disabled={!roomId.trim() || isJoining}
        >
          {isJoining ? (
            <>
              <SpinnerIcon className="w-5 h-5 mr-2" />
              Joining...
            </>
          ) : (
            'Join Room'
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;