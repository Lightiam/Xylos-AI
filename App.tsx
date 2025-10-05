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
import MediaError from './components/MediaError';
import { SpinnerIcon } from './components/icons';
import { getUserMedia, stopMediaStream } from './utils/media';

const initialOtherParticipants: Omit<Participant, 'name' | 'isHandRaised' | 'avatar'>[] = [
  { id: 'participant-2', isMuted: false, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-3', isMuted: true, isVideoOff: false, isSelf: false, isScreenSharing: false },
  { id: 'participant-4', isMuted: false, isVideoOff: true, isSelf: false, isScreenSharing: false },
];

const participantNames = ['Maria Garcia', 'Chen Wei', 'Emily Carter'];

type MeetingState = 'dashboard' | 'loading_media' | 'media_error' | 'in_meeting';

const App: React.FC = () => {
  // Global App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Meeting Flow State
  const [meetingState, setMeetingState] = useState<MeetingState>('dashboard');
  const [mediaErrorMessage, setMediaErrorMessage] = useState('');

  // Meeting Instance State
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

  const acquireMedia = useCallback(async () => {
    setMeetingState('loading_media');
    try {
      const stream = await getUserMedia();
      setLocalStream(stream);
      setMeetingState('in_meeting');
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMediaErrorMessage(
          "Permission Denied: Xylos AI needs access to your camera and microphone. Please grant permission in your browser's site settings (usually the lock icon in the address bar) and then click Retry."
        );
      } else {
        setMediaErrorMessage(
          `An unexpected error occurred: ${err.message}. Please ensure your camera/microphone are not in use by another application and try again.`
        );
      }
      setLocalStream(null);
      setMeetingState('media_error');
    }
  }, []);
  
  const cleanupStreams = useCallback(() => {
    stopMediaStream(localStream);
    stopMediaStream(screenStream);
    setLocalStream(null);
    setScreenStream(null);
  }, [localStream, screenStream]);

  // Effect to cleanup streams when component unmounts
  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, [cleanupStreams]);


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
        id: currentUser.id, name: currentUser.name, 
        isMuted: false, isVideoOff: false, isSelf: true, 
        isScreenSharing: false, isHandRaised: false,
        avatar: currentUser.avatar 
    };
    
    const otherParticipants: Participant[] = initialOtherParticipants.map((p, index) => ({
      ...p, name: participantNames[index], isHandRaised: false,
      avatar: `https://robohash.org/${participantNames[index].replace(/[^a-zA-Z0-9]/g, '')}.png?size=150x150&set=set4`
    }));

    setParticipants([selfParticipant, ...otherParticipants]);
    setMessages([
        { id: uuidv4(), senderName: 'System', text: `Meeting "${details.title}" started.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSelf: false },
    ]);
    setIsNewMeetingModalOpen(false);
    acquireMedia(); // This kicks off the media acquisition flow
  };

  const cleanupMeetingState = useCallback(() => {
    cleanupStreams();
    setParticipants([]);
    setMeetingDetails(null);
    setMessages([]);
    setMediaErrorMessage('');
    setActiveVBUrl(null);
    setIsChatOpen(false);
  }, [cleanupStreams]);

  const handleToggleMute = useCallback(() => setParticipants(p => p.map(p => (p.isSelf ? { ...p, isMuted: !p.isMuted } : p))), []);
  const handleToggleVideo = useCallback(() => {
    if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setParticipants(p => p.map(p => (p.isSelf ? { ...p, isVideoOff: !p.isVideoOff } : p)));
  }, [localStream]);
  
  const handleToggleScreenShare = useCallback(async () => {
    if (participants.some(p => p.isSelf && p.isScreenSharing)) {
      stopMediaStream(screenStream);
      setScreenStream(null);
      setParticipants(p => p.map(p => (p.isSelf ? { ...p, isScreenSharing: false } : p)));
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getVideoTracks()[0]?.addEventListener('ended', () => {
            stopMediaStream(stream);
            setScreenStream(null);
            setParticipants(p => p.map(p => (p.isSelf ? { ...p, isScreenSharing: false } : p)));
        });
        setScreenStream(stream);
        setParticipants(p => p.map(p => (p.isSelf ? { ...p, isScreenSharing: true } : p)));
      } catch (err) { console.error("Screen share error:", err); }
    }
  }, [participants, screenStream]);

  const handleEndCall = () => {
    cleanupMeetingState();
    setMeetingState('dashboard');
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
    cleanupMeetingState();
    apiLogout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMeetingState('dashboard');
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

  const renderContent = () => {
    if (!isAuthenticated || !currentUser) return <AuthPage onAuthSuccess={handleAuthSuccess} />;

    switch (meetingState) {
        case 'dashboard':
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
        case 'loading_media':
            return (
                <div className="h-screen w-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white">
                    <SpinnerIcon className="w-12 h-12 mb-4" />
                    <p className="text-lg">Accessing camera and microphone...</p>
                </div>
            );
        case 'media_error':
            return <MediaError errorMessage={mediaErrorMessage} onRetry={acquireMedia} onBack={() => setMeetingState('dashboard')} />;

        case 'in_meeting':
            if (localStream) {
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
            }
            // Fallback if state is inconsistent
            return null;
        
        default:
            return null;
    }
  }

  if (isInitializing) return <div className="h-screen w-screen bg-[#1A1A1A] flex items-center justify-center text-white">Loading...</div>;
  
  return renderContent();
};

export default App;
