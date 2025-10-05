import React from 'react';
import { MicOnIcon, MicOffIcon, VideoOnIcon, VideoOffIcon, EndCallIcon, ChatIcon, ScreenShareIcon, SparklesIcon, HandIcon } from './icons';
import IconButton from './IconButton';

interface ControlsProps {
    isMuted: boolean;
    onToggleMute: () => void;
    isVideoOff: boolean;
    onToggleVideo: () => void;
    isScreenSharing: boolean;
    onToggleScreenShare: () => void;
    isHandRaised: boolean;
    onToggleHandRaise: () => void;
    onEndCall: () => void;
    onToggleChat: () => void;
    onToggleVBPanel: () => void;
    isVBPanelOpen: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
    isMuted, 
    onToggleMute,
    isVideoOff,
    onToggleVideo,
    isScreenSharing,
    onToggleScreenShare,
    isHandRaised,
    onToggleHandRaise,
    onEndCall,
    onToggleChat,
    onToggleVBPanel,
    isVBPanelOpen
}) => {
    return (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 w-full max-w-lg">
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-full p-1 flex justify-center items-center space-x-2">
                <IconButton onClick={onToggleMute} variant={isMuted ? 'toggled' : 'default'} tooltip={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <MicOffIcon /> : <MicOnIcon />}
                </IconButton>
                <IconButton onClick={onToggleVideo} variant={isVideoOff ? 'toggled' : 'default'} tooltip={isVideoOff ? 'Start Video' : 'Stop Video'}>
                    {isVideoOff ? <VideoOffIcon /> : <VideoOnIcon />}
                </IconButton>
                <IconButton onClick={onToggleScreenShare} variant={isScreenSharing ? 'primary' : 'default'} tooltip={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
                    <ScreenShareIcon />
                </IconButton>
                <IconButton onClick={onToggleHandRaise} variant={isHandRaised ? 'primary' : 'default'} tooltip={isHandRaised ? 'Lower Hand' : 'Raise Hand'}>
                    <HandIcon />
                </IconButton>
                 <IconButton onClick={onToggleVBPanel} variant={isVBPanelOpen ? 'toggled' : 'default'} tooltip="Virtual Background">
                    <SparklesIcon />
                </IconButton>
                <IconButton onClick={onEndCall} variant="danger" tooltip="End Call">
                    <EndCallIcon />
                </IconButton>
                 <IconButton onClick={onToggleChat} variant="default" tooltip="Toggle Chat">
                    <ChatIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default Controls;