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
import { updateUser, validateSession, logout as apiLogout } from './services/api';
import Dashboard from './components/Dashboard';

const initialOtherParticipants: Omit<Participant, 'name' | 'isHandRaised' | 'avatar'>[] = [
  { id: 'participant-2', isMuted: false, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-3', isMuted: true, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-4', isMuted: false, isVideoOff: true, isSelf: false, isScreenSharing: false },
];

const participantNames = ['Maria Garcia', 'Chen Wei', 'Emily Carter'];

const App: React.FC = () => {
  // Global App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Meeting State
  const [inMeeting, setInMeeting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [activeVBUrl, setActiveVBUrl] = useState<string | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<{ title: string; date?: string; time?: string } | null>(null);

  // Modal & Panel State
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVBPanelOpen, setIsVBPanelOpen] = useState(false);
  
  const localParticipant = participants.find(p => p.isSelf);
  
  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  // Check for an active session on initial app load
  useEffect(() => {
    const checkSession = async () => {
      const user = await validateSession();
      if (user) {
        handleAuthSuccess(user);
      }
      setIsInitializing(false);
    };
    checkSession();
  }, [handleAuthSuccess]);

  // Get user media only when entering a meeting
  useEffect(() => {
    if (inMeeting) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
        .then(stream => setLocalStream(stream))
        .catch(err => {
            console.error("Error getting user media:", err);
            alert("Could not access camera and microphone. Please check site permissions.");
            setInMeeting(false); // Go back to dashboard if media fails
        });
    }
    
    // Cleanup: stop tracks when leaving a meeting
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
  }, [inMeeting]);

  const processedStream = useVirtualBackground(localStream, activeVBUrl);
  const streamForLocalParticipant = activeVBUrl ? processedStream : localStream;

  useEffect(() => {
      if (localParticipant?.isScreenSharing && activeVBUrl) {
          setActiveVBUrl(null);
          setIsVBPanelOpen(false);
          alert("Virtual background is disabled while screen sharing.");
      }
  }, [localParticipant?.isScreenSharing, activeVBUrl]);

  const handleStartMeeting = (details: { title: string; date?: string; time?: string }) => {
    if (!currentUser) return;
    
    setMeetingDetails(details);
    const selfParticipant: Participant = { 
        id: currentUser.id,
        name: currentUser.name, 
        isMuted: false, 
        isVideoOff: false, 
        isSelf: true, 
        isScreenSharing: false, 
        isHandRaised: false,
        avatar: currentUser.avatar 
    };
    
    // Setup mock participants for demonstration
    const otherParticipants: Participant[] = initialOtherParticipants.map((p, index) => ({
      ...p,
      name: participantNames[index],
      isHandRaised: false,
      avatar: `https://robohash.org/${participantNames[index].replace(/[^a-zA-Z0-9]/g, '')}.png?size=150x150&set=set4`
    }));

    setParticipants([selfParticipant, ...otherParticipants]);
    setMessages([
        { id: uuidv4(), senderName: 'System', text: `Meeting "${details.title}" started.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSelf: false },
    ]);
    setInMeeting(true);
    setIsNewMeetingModalOpen(false);
  };

  const handleToggleMute = useCallback(() => setParticipants(p => p.map(p => (p.isSelf ? { ...p, isMuted: !p.isMuted } : p))), []);
  const handleToggleVideo = useCallback(() => {
    if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setParticipants(p => p.map(p => (p.isSelf ? { ...p, isVideoOff: !p.isVideoOff } : p)));
  }, [localStream]);
  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach(t => t.stop());
    setScreenStream(null);
    setParticipants(p => p.map(p => (p.isSelf ? { ...p, isScreenSharing: false } : p)));
  }, [screenStream]);
  const handleToggleScreenShare = useCallback(async () => {
    if (participants.some(p => p.isSelf && p.isScreenSharing)) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getVideoTracks()[0]?.addEventListener('ended', stopScreenShare);
        setScreenStream(stream);
        setParticipants(p => p.map(p => (p.isSelf ? { ...p, isScreenSharing: true } : p)));
      } catch (err) { console.error("Screen share error:", err); }
    }
  }, [participants, stopScreenShare]);
  const handleEndCall = () => {
    setInMeeting(false);
    setParticipants([]);
    setMeetingDetails(null);
    setMessages([]);
    // The useEffect cleanup for `inMeeting` will handle stopping media tracks.
  };
  const handleToggleChat = () => setIsChatOpen(prev => !prev);
  const handleSendMessage = (text: string) => {
    if (!localParticipant) return;
    const newMessage: ChatMessage = {
      id: uuidv4(),
      senderName: localParticipant.name, text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSelf: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setInMeeting(false);
  };

  const handleSaveSettings = async (settings: { name: string; avatar: string }) => {
    if (!currentUser) return;
    try {
      const updatedUser = await updateUser(currentUser.id, settings);
      setCurrentUser(updatedUser);
      setParticipants(prev => prev.map(p => (p.isSelf ? { ...p, name: updatedUser.name, avatar: updatedUser.avatar } : p)));
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Could not save settings.");
    }
  };
  const handleToggleHandRaise = useCallback(() => setParticipants(p => p.map(p => (p.isSelf ? { ...p, isHandRaised: !p.isHandRaised } : p))), []);

  if (isInitializing) return <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center text-white">Loading...</div>;
  if (!isAuthenticated || !currentUser) return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  
  if (!inMeeting) {
    return (
      <>
        <Dashboard 
            user={currentUser} 
            onStartInstantMeeting={() => handleStartMeeting({ title: 'Instant Meeting' })}
            onScheduleMeeting={() => setIsNewMeetingModalOpen(true)}
            onLogout={handleLogout}
        />
        <NewMeetingModal isOpen={isNewMeetingModalOpen} onClose={() => setIsNewMeetingModalOpen(false)} onCreateMeeting={handleStartMeeting} />
      </>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1A1A1A] text-white flex flex-col font-sans">
        {localParticipant && <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveSettings} currentName={localParticipant.name} currentAvatar={localParticipant.avatar || ''} />}
        <main className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col relative p-4 pt-16 pb-20">
                <Header onNewMeeting={() => setIsNewMeetingModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} onLogout={handleLogout} meetingDetails={meetingDetails} />
                <div className="flex-1 flex items-center justify-center">
                    <VideoGrid participants={participants} localStream={streamForLocalParticipant} />
                </div>
                {localParticipant && (
                    <>
                    {isVBPanelOpen && <VirtualBackgroundPanel onSelect={setActiveVBUrl} onClose={() => setIsVBPanelOpen(false)} activeBackgroundUrl={activeVBUrl} />}
                    <Controls
                        isMuted={localParticipant.isMuted} onToggleMute={handleToggleMute}
                        isVideoOff={localParticipant.isVideoOff} onToggleVideo={handleToggleVideo}
                        isScreenSharing={!!localParticipant.isScreenSharing} onToggleScreenShare={handleToggleScreenShare}
                        isHandRaised={!!localParticipant.isHandRaised} onToggleHandRaise={handleToggleHandRaise}
                        onEndCall={handleEndCall} onToggleChat={handleToggleChat}
                        onToggleVBPanel={() => setIsVBPanelOpen(p => !p)} isVBPanelOpen={isVBPanelOpen}
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
