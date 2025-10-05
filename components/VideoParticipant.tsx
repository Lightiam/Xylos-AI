import React, { useEffect, useRef } from 'react';
import { Participant } from '../types';
import { MicOffIcon, VideoOffIcon, ScreenShareIcon, HandIcon } from './icons';

interface VideoParticipantProps {
  participant: Participant;
  stream?: MediaStream;
}

const VideoParticipant: React.FC<VideoParticipantProps> = ({ participant, stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  const content = participant.isSelf ? (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      muted // Mute self view to avoid audio feedback
      className={`w-full h-full object-cover transition-opacity duration-300 transform -scale-x-100 ${participant.isVideoOff || participant.isScreenSharing ? 'opacity-0' : 'opacity-100'}`}
    />
  ) : (
    <img 
      src={`https://picsum.photos/800/600?random=${participant.id}`} 
      alt={participant.name} 
      className={`w-full h-full object-cover transition-opacity duration-300 ${participant.isVideoOff || participant.isScreenSharing ? 'opacity-0' : 'opacity-100'}`}
    />
  );

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      {content}
      {(participant.isVideoOff && !participant.isScreenSharing) && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            {participant.avatar ? (
                <img src={participant.avatar} alt={participant.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
                <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {participant.name.charAt(0)}
                </div>
            )}
        </div>
      )}
      {participant.isScreenSharing && (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                <ScreenShareIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">{participant.isSelf ? 'You are sharing your screen' : `${participant.name} is sharing`}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-50 rounded-tr-lg">
        <span className="text-white text-sm font-medium">{participant.name}</span>
      </div>
      {participant.isHandRaised && (
          <div className="absolute top-2 left-2 p-1.5 bg-yellow-400 bg-opacity-90 rounded-full animate-bounce" title={`${participant.name} raised their hand`}>
            <HandIcon className="w-5 h-5 text-gray-900" />
          </div>
        )}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">
        {participant.isMuted && (
          <div className="p-1.5 bg-black bg-opacity-50 rounded-full" title="Microphone is muted">
            <MicOffIcon className="w-4 h-4 text-white" />
          </div>
        )}
        {participant.isVideoOff && (
          <div className="p-1.5 bg-black bg-opacity-50 rounded-full" title="Video is off">
            <VideoOffIcon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoParticipant;