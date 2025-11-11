import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerDialogProps {
  videoUrl: string;
  videoName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerDialog({ videoUrl, videoName, isOpen, onClose }: VideoPlayerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative flex flex-col items-center justify-center min-h-[50vh]">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Video title */}
          <div className="absolute top-4 left-4 z-50 text-white bg-black/50 px-4 py-2 rounded backdrop-blur-sm">
            <p className="text-sm font-medium">{videoName}</p>
          </div>

          {/* Video player */}
          <div className="w-full h-full flex items-center justify-center p-8">
            <video
              ref={videoRef}
              src={videoUrl}
              controls={true}
              autoPlay={true}
              className={cn(
                "max-w-full max-h-[85vh] w-auto h-auto rounded",
                "shadow-2xl"
              )}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-white/70 text-xs bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
            Press <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">Esc</kbd> to close • 
            <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">Space</kbd> to play/pause
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
