export interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSelf: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface User {
  email: string;
  name: string;
  password?: string; // Stored for simulation purposes
  avatar: string;
  lastLogin: string | null;
}