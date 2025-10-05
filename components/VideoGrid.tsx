import React from 'react';
import { Participant } from '../types';
import VideoParticipant from './VideoParticipant';

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({ participants, localStream }) => {
  const getGridClass = (count: number): string => {
    if (count <= 1) return 'grid-cols-1 max-w-4xl';
    if (count <= 4) return 'grid-cols-2 max-w-6xl';
    if (count <= 6) return 'grid-cols-3 max-w-full';
    if (count <= 8) return 'grid-cols-4 max-w-full';
    return 'grid-cols-4 max-w-full'; // Fallback for more than 8 participants
  };

  const gridClass = getGridClass(participants.length);

  return (
    <div className={`grid ${gridClass} gap-4 mx-auto place-content-center`}>
      {participants.map((p) => (
        <VideoParticipant 
          key={p.id} 
          participant={p}
          stream={p.isSelf ? localStream : undefined}
        />
      ))}
    </div>
  );
};

export default VideoGrid;