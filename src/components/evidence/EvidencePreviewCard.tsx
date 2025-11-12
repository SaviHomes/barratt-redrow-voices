import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Image as ImageIcon, Volume2, VolumeX } from "lucide-react";
import { EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";

interface EvidencePreviewCardProps {
  evidence: EvidenceWithPhotos;
  onClick?: () => void;
}

export default function EvidencePreviewCard({ evidence, onClick }: EvidencePreviewCardProps) {
  const imageCount = evidence.photos.length;
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Use featured_image_index to select thumbnail, with fallback
  const featuredIndex = evidence.featured_image_index || 0;
  const thumbnailPhoto = evidence.photos[featuredIndex] || evidence.photos[0];
  const isThumbnailVideo = thumbnailPhoto && isVideo(thumbnailPhoto.name);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'severe': return 'bg-destructive text-destructive-foreground';
      case 'moderate': return 'bg-orange-500 text-white';
      case 'minor': return 'bg-yellow-500 text-black';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      structural: '🏗️',
      electrical: '⚡',
      plumbing: '🚰',
      finish: '🎨',
      other: '📋',
    };
    return icons[category.toLowerCase()] || '📋';
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      <div className="grid md:grid-cols-[240px_1fr] gap-0">
        {/* Thumbnail */}
        <div className="relative w-full aspect-square md:aspect-auto overflow-hidden bg-muted flex items-center justify-center">
          {thumbnailPhoto ? (
            <>
              {isThumbnailVideo ? (
                <video
                  ref={videoRef}
                  src={thumbnailPhoto.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={thumbnailPhoto.url}
                  alt={evidence.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              
              {isThumbnailVideo && (
                <button
                  onClick={handleToggleMute}
                  className="absolute bottom-2 left-2 bg-black/70 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
                  title={isMuted ? "Unmute video" : "Mute video"}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              )}
              
              {imageCount > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  +{imageCount - 1}
                </div>
              )}
            </>
          ) : (
            <div className="text-6xl opacity-50">
              {getCategoryIcon(evidence.category)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {getCategoryIcon(evidence.category)} {evidence.category}
            </Badge>
            <Badge className={`text-xs ${getSeverityColor(evidence.severity)}`}>
              {evidence.severity}
            </Badge>
            {imageCount > 0 && (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs ml-auto">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(evidence.created_at).toLocaleDateString()}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl leading-tight line-clamp-2">
            {evidence.title}
          </h3>

          {/* Description - Show more text */}
          {evidence.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
              {evidence.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
