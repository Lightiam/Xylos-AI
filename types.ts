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
  id: string; // Corresponds to the database primary key
  email: string;
  name: string;
  password?: string; // Should not be sent to client from a real API
  avatar: string;
  lastLogin: string | null;
}