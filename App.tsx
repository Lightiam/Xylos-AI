import React, { useState, useCallback, useEffect } from 'react';
import { Participant, ChatMessage, User } from './types';
import Header from './components/Header';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';
import ChatSidebar from './components/ChatSidebar';
import NewMeetingModal from './components/NewMeetingModal';
import { v4 as uuidv4 } from 'uuid';
import AuthPage from './components/AuthPage';
import { useVirtualBackground } from './hooks/useVirtualBackground';
import VirtualBackgroundPanel from './components/VirtualBackgroundPanel';
import SettingsModal from './components/SettingsModal';

const initialOtherParticipants: Omit<Participant, 'name' | 'isHandRaised' | 'avatar'>[] = [
  { id: 'participant-2', isMuted: false, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-3', isMuted: true, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-4', isMuted: false, isVideoOff: true, isSelf: false, isScreenSharing: false },
];

const participantNames = ['Maria Garcia', 'Chen Wei', 'Emily Carter'];

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(() => {
    // Other participants are for demonstration; in a real app, this would come from a server
    const otherParticipants: Participant[] = initialOtherParticipants.map((p, index) => ({
      ...p,
      name: participantNames[index],
      isHandRaised: false,
      avatar: `https://robohash.org/${participantNames[index].replace(/[^a-zA-Z0-9]/g, '')}.png?size=150x150&set=set4`
    }));
    return [...otherParticipants];
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVBPanelOpen, setIsVBPanelOpen] = useState(false);
  const [activeVBUrl, setActiveVBUrl] = useState<string | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<{ title: string; date?: string; time?: string } | null>(null);

  const localParticipant = participants.find(p => p.isSelf);
  
  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    const selfParticipant: Participant = { 
        id: uuidv4(), 
        name: user.name, 
        isMuted: false, 
        isVideoOff: false, 
        isSelf: true, 
        isScreenSharing: false, 
        isHandRaised: false,
        avatar: user.avatar 
    };
    setParticipants(prev => [selfParticipant, ...prev.filter(p => !p.isSelf)]);
    setIsAuthenticated(true);
    setMessages([
        { id: uuidv4(), senderName: 'System', text: `Welcome, ${user.name}!`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSelf: false },
    ]);
  }, []);

  // Check for an active session on initial app load
  useEffect(() => {
    const activeUserEmail = sessionStorage.getItem('xylos_ai_active_user');
    if (activeUserEmail) {
      const usersJSON = localStorage.getItem('xylos_ai_users');
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
      const user = users.find(u => u.email === activeUserEmail);
      if (user) {
        handleAuthSuccess(user);
      }
    }
  }, [handleAuthSuccess]);

  // Get user media on mount after authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
        .then(stream => setLocalStream(stream))
        .catch(err => {
            console.error("Error getting user media:", err);
            alert("Could not access camera and microphone. Please check site permissions.");
        });
    }
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    }
  }, [isAuthenticated]);

  // Apply virtual background
  const processedStream = useVirtualBackground(localStream, activeVBUrl);

  const streamForLocalParticipant = activeVBUrl ? processedStream : localStream;

  // Disable VB when screen sharing
  useEffect(() => {
      if (localParticipant?.isScreenSharing && activeVBUrl) {
          setActiveVBUrl(null);
          setIsVBPanelOpen(false);
          alert("Virtual background is disabled while screen sharing.");
      }
  }, [localParticipant?.isScreenSharing, activeVBUrl]);

  const handleToggleMute = useCallback(() => {
    setParticipants(prev =>
      prev.map(p => (p.isSelf ? { ...p, isMuted: !p.isMuted } : p))
    );
  }, []);

  const handleToggleVideo = useCallback(() => {
    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
    }
    setParticipants(prev =>
      prev.map(p => (p.isSelf ? { ...p, isVideoOff: !p.isVideoOff } : p))
    );
  }, [localStream]);

  const stopScreenShare = useCallback(() => {
    setScreenStream(currentStream => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    setParticipants(prev =>
      prev.map(p => (p.isSelf ? { ...p, isScreenSharing: false } : p))
    );
  }, []);

  const handleToggleScreenShare = useCallback(async () => {
    const isCurrentlySharing = participants.some(p => p.isSelf && p.isScreenSharing);

    if (isCurrentlySharing) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = stopScreenShare;
        }

        setScreenStream(stream);
        setParticipants(prev =>
          prev.map(p => (p.isSelf ? { ...p, isScreenSharing: true } : p))
        );
      } catch (err) {
        console.error("Error starting screen share:", err);
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          console.log("Screen share prompt was cancelled by the user.");
        } else {
          alert('Could not start screen sharing. Please check browser permissions.');
        }
      }
    }
  }, [participants, stopScreenShare]);

  const handleEndCall = () => {
    alert('Call Ended');
    if (screenStream) {
        stopScreenShare();
    }
    localStream?.getTracks().forEach(track => track.stop());
  };

  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  
  const handleSendMessage = (text: string) => {
    if (!localParticipant) return;
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      senderName: localParticipant.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleNewMeeting = () => setIsNewMeetingModalOpen(true);
  const handleCloseNewMeetingModal = () => setIsNewMeetingModalOpen(false);
  
  const handleLoginOrSignup = (user: User) => {
    sessionStorage.setItem('xylos_ai_active_user', user.email);
    handleAuthSuccess(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('xylos_ai_active_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setParticipants(prev => prev.filter(p => !p.isSelf));
    // Optional: Reset other states
    setMessages([]);
    setIsChatOpen(false);
    setMeetingDetails(null);
  };

  const handleCreateMeeting = (details: { title: string; date?: string; time?: string }) => {
    setMeetingDetails(details);
    setIsNewMeetingModalOpen(false);
    alert(`Meeting "${details.title}" is ready.`);
  };

  const handleToggleVBPanel = () => setIsVBPanelOpen(prev => !prev);

  const handleSelectVB = (url: string | null) => {
      if (localParticipant?.isScreenSharing) {
          alert("Cannot enable virtual background while screen sharing.");
          return;
      }
      setActiveVBUrl(url);
  };
  
  const handleOpenSettings = () => setIsSettingsModalOpen(true);
  const handleCloseSettings = () => setIsSettingsModalOpen(false);
  
  const handleSaveSettings = (settings: { name: string; avatar: string }) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, name: settings.name, avatar: settings.avatar };
    setCurrentUser(updatedUser);
    
    const usersJSON = localStorage.getItem('xylos_ai_users');
    let users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
    users = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('xylos_ai_users', JSON.stringify(users));

    setParticipants(prev =>
      prev.map(p => (p.isSelf ? { ...p, name: settings.name, avatar: settings.avatar } : p))
    );
    setIsSettingsModalOpen(false);
  };

  const handleToggleHandRaise = useCallback(() => {
    setParticipants(prev =>
      prev.map(p => (p.isSelf ? { ...p, isHandRaised: !p.isHandRaised } : p))
    );
  }, []);

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleLoginOrSignup} />;
  }

  return (
    <div className="h-screen w-screen bg-[#1A1A1A] text-white flex flex-col font-sans">
        <NewMeetingModal 
            isOpen={isNewMeetingModalOpen} 
            onClose={handleCloseNewMeetingModal} 
            onCreateMeeting={handleCreateMeeting}
        />
        {localParticipant && (
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleCloseSettings}
                onSave={handleSaveSettings}
                currentName={localParticipant.name}
                currentAvatar={localParticipant.avatar || ''}
            />
        )}
        <main className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col relative p-4 pt-16 pb-20">
                <Header 
                    onNewMeeting={handleNewMeeting}
                    onOpenSettings={handleOpenSettings}
                    onLogout={handleLogout}
                    meetingDetails={meetingDetails}
                />
                <div className="flex-1 flex items-center justify-center">
                    <VideoGrid participants={participants} localStream={streamForLocalParticipant} />
                </div>
                {localParticipant && (
                    <>
                    {isVBPanelOpen && (
                        <VirtualBackgroundPanel 
                            onSelect={handleSelectVB} 
                            onClose={() => setIsVBPanelOpen(false)}
                            activeBackgroundUrl={activeVBUrl}
                        />
                    )}
                    <Controls
                        isMuted={localParticipant.isMuted}
                        onToggleMute={handleToggleMute}
                        isVideoOff={localParticipant.isVideoOff}
                        onToggleVideo={handleToggleVideo}
                        isScreenSharing={!!localParticipant.isScreenSharing}
                        onToggleScreenShare={handleToggleScreenShare}
                        isHandRaised={!!localParticipant.isHandRaised}
                        onToggleHandRaise={handleToggleHandRaise}
                        onEndCall={handleEndCall}
                        onToggleChat={handleToggleChat}
                        onToggleVBPanel={handleToggleVBPanel}
                        isVBPanelOpen={isVBPanelOpen}
                    />
                    </>
                )}
            </div>
            <ChatSidebar messages={messages} onSendMessage={handleSendMessage} isOpen={isChatOpen} />
        </main>
    </div>
  );
};

export default App;