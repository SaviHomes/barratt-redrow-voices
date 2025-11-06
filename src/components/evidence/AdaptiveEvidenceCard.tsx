import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";

interface AdaptiveEvidenceCardProps {
  evidence: EvidenceWithPhotos;
  onClick?: () => void;
}

function getEvidenceLayout(evidence: EvidenceWithPhotos) {
  const imageCount = evidence.photos.length;
  const descriptionLength = evidence.description?.length || 0;

  if (imageCount === 1 && descriptionLength < 200) return 'compact-card';
  if (imageCount > 3 && descriptionLength < 50) return 'gallery-focus';
  if (imageCount > 2 && descriptionLength > 200) return 'rich-media';
  if (imageCount === 0 && descriptionLength > 100) return 'text-focus';
  return 'balanced';
}

export default function AdaptiveEvidenceCard({ evidence, onClick }: AdaptiveEvidenceCardProps) {
  const layout = getEvidenceLayout(evidence);
  const imageCount = evidence.photos.length;
  const hasDescription = evidence.description && evidence.description.length > 0;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
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

  const renderImages = () => {
    if (imageCount === 0) return null;

    if (layout === 'compact-card' || layout === 'balanced') {
      return (
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <img
            src={evidence.photos[0].url}
            alt={evidence.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {imageCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              +{imageCount - 1} more
            </div>
          )}
        </div>
      );
    }

    if (layout === 'gallery-focus') {
      const displayPhotos = evidence.photos.slice(0, 4);
      return (
        <div className="grid grid-cols-2 gap-1 rounded-t-lg overflow-hidden">
          {displayPhotos.map((photo, idx) => (
            <div key={photo.path} className="relative aspect-square overflow-hidden">
              <img
                src={photo.url}
                alt={`${evidence.title} - ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {idx === 3 && imageCount > 4 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-semibold text-lg">
                  +{imageCount - 4} more
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (layout === 'rich-media') {
      return (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
          <img
            src={evidence.photos[evidence.featured_image_index || 0]?.url || evidence.photos[0].url}
            alt={evidence.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderDescription = () => {
    if (!hasDescription) return null;

    const maxLength = layout === 'text-focus' ? 300 : 150;
    const truncated = evidence.description!.length > maxLength
      ? evidence.description!.substring(0, maxLength) + '...'
      : evidence.description;

    return (
      <p className={cn(
        "text-muted-foreground",
        layout === 'text-focus' ? "text-base leading-relaxed" : "text-sm"
      )}>
        {truncated}
      </p>
    );
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
        layout === 'text-focus' && "bg-gradient-to-br from-card to-muted"
      )}
      onClick={onClick}
    >
      {imageCount > 0 && renderImages()}
      
      <div className="p-4 space-y-3">
        {layout === 'text-focus' && (
          <div className="text-4xl mb-2">
            {getCategoryIcon(evidence.category)}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {evidence.category}
          </Badge>
          <Badge className={cn("text-xs", getSeverityColor(evidence.severity))}>
            {evidence.severity}
          </Badge>
          {imageCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              {imageCount}
            </Badge>
          )}
        </div>

        <h3 className={cn(
          "font-semibold line-clamp-2",
          layout === 'text-focus' ? "text-xl" : "text-lg"
        )}>
          {evidence.title}
        </h3>

        {renderDescription()}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(evidence.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
