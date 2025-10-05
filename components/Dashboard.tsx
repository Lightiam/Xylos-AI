import React from 'react';
import { User } from '../types';
import { VideoOnIcon, CalendarIcon } from './icons';

interface DashboardProps {
  user: User;
  onStartInstantMeeting: () => void;
  onScheduleMeeting: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartInstantMeeting, onScheduleMeeting, onLogout }) => {
  return (
    <div 
        className="h-screen w-screen text-white flex items-center justify-center font-sans p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute top-4 right-4">
        <button onClick={onLogout} className="text-sm bg-gray-800 bg-opacity-50 hover:bg-opacity-80 transition-colors text-gray-300 hover:text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      <div className="w-full max-w-lg text-center">
          <div className="flex justify-center mb-6">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 shadow-lg"/>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
          <p className="text-lg text-gray-300 mb-10">Ready to connect?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={onStartInstantMeeting}
                className="bg-green-600 text-white p-6 text-lg font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-3"
              >
                <VideoOnIcon className="w-8 h-8"/>
                <span>Start Instant Meeting</span>
              </button>
              <button 
                onClick={onScheduleMeeting}
                className="bg-indigo-600 text-white p-6 text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-3"
              >
                <CalendarIcon className="w-8 h-8"/>
                <span>Schedule a Meeting</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
