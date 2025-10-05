import { useEffect, useRef, useState } from 'react';

// This is a global variable from the script tag in index.html
declare const SelfieSegmentation: any;

export function useVirtualBackground(
  sourceStream: MediaStream | null,
  backgroundSource: string | null // Can be null, 'blur', or a URL
) {
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
  const segmentationRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  
  useEffect(() => {
    // Refs for internal elements
    const canvas = document.createElement('canvas');
    const sourceVideo = document.createElement('video');
    sourceVideo.autoplay = true;
    sourceVideo.playsInline = true;
    sourceVideo.muted = true; // Mute the source video element to prevent audio feedback

    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    
    // Cleanup function
    const cleanup = () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (segmentationRef.current) {
        segmentationRef.current.close();
        segmentationRef.current = null;
      }
      // Stop only the video track we created, not the original audio tracks.
      processedStream?.getVideoTracks().forEach(track => track.stop());
      setProcessedStream(null);
      sourceVideo.srcObject = null;
    };

    if (!backgroundSource || !sourceStream) {
      cleanup();
      return;
    }

    const isImageUrl = backgroundSource !== 'blur';
    if (isImageUrl) {
        bgImage.src = backgroundSource;
    }
    
    // Set up source video with the stream
    sourceVideo.srcObject = sourceStream;
    sourceVideo.play().catch(e => console.error("Video play failed", e));

    const segmentation = new SelfieSegmentation({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    segmentation.setOptions({ modelSelection: 1 });
    segmentationRef.current = segmentation;
    
    segmentation.onResults((results: any) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !results.image) return;

      canvas.width = results.image.width;
      canvas.height = results.image.height;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

      if (isImageUrl) {
        // Image Background Logic
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'destination-atop';
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      } else {
        // Blur Background Logic
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'destination-over';
        ctx.filter = 'blur(16px)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }
      
      ctx.restore();
    });

    const processVideo = async () => {
      if (segmentationRef.current && sourceVideo.readyState >= 3) {
        await segmentationRef.current.send({ image: sourceVideo });
      }
      animationFrameRef.current = requestAnimationFrame(processVideo);
    };

    const handleReady = () => {
        processVideo();
        
        if (canvas.captureStream) {
            const canvasStream = canvas.captureStream(30);
            const videoTrack = canvasStream.getVideoTracks()[0];
            const audioTracks = sourceStream.getAudioTracks();

            if (videoTrack) {
                // Combine the new video track with the original audio tracks
                const finalStream = new MediaStream([...audioTracks, videoTrack]);
                setProcessedStream(finalStream);
            }
        }
    };
    
    sourceVideo.addEventListener('loadeddata', handleReady);

    return () => {
        sourceVideo.removeEventListener('loadeddata', handleReady);
        cleanup();
    };

  }, [sourceStream, backgroundSource]);

  return processedStream;
}
