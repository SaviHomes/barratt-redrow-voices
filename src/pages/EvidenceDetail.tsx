import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEvidencePhotos, EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Play, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayerDialog } from "@/components/evidence/VideoPlayerDialog";
import { CommentsSection } from "@/components/comments/CommentsSection";
import PhotoCommentsDialog from "@/components/comments/PhotoCommentsDialog";

export default function EvidenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentVideoName, setCurrentVideoName] = useState("");
  const [photoCommentsOpen, setPhotoCommentsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvidence();
    }
  }, [id]);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('id', id)
        .eq('moderation_status', 'approved')
        .eq('is_public', true)
        .single();

      if (error) throw error;
      setEvidence(data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      setEvidence(null);
    } finally {
      setLoading(false);
    }
  };

  const evidenceArray = useMemo(() => 
    evidence ? [evidence] : [], 
    [evidence?.id]
  );
  
  const { evidenceWithPhotos } = useEvidencePhotos(evidenceArray);
  const evidenceData: EvidenceWithPhotos | undefined = evidenceWithPhotos[0];

  // Fetch photo comment counts
  const { data: photoCommentCounts } = useQuery({
    queryKey: ['photo-comment-counts', evidenceData?.photos.map(p => p.captionId)],
    queryFn: async () => {
      const captionIds = evidenceData?.photos
        .map(p => p.captionId)
        .filter(Boolean) || [];
      
      if (captionIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('photo_comments')
        .select('photo_caption_id')
        .in('photo_caption_id', captionIds)
        .eq('moderation_status', 'approved');
      
      if (error) throw error;
      
      // Count comments per photo
      const counts: Record<string, number> = {};
      data.forEach(comment => {
        counts[comment.photo_caption_id] = (counts[comment.photo_caption_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!evidenceData?.photos.length
  });

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

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const handleMediaClick = (index: number, url: string, name: string) => {
    if (evidenceData && isVideo(evidenceData.photos[index].name)) {
      setCurrentVideoUrl(url);
      setCurrentVideoName(name);
      setVideoPlayerOpen(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!evidence || !evidenceData) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12 max-w-6xl text-center">
          <h1 className="text-3xl font-bold mb-4">Evidence Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This evidence may have been removed or is not publicly available.
          </p>
          <Button variant="default" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="default"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Homepage
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              {getCategoryIcon(evidenceData.category)} {evidenceData.category}
            </Badge>
            <Badge className={`text-sm ${getSeverityColor(evidenceData.severity)}`}>
              {evidenceData.severity}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(evidenceData.created_at).toLocaleDateString()}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-foreground">
            {evidenceData.title}
          </h1>

          {/* Description with Expand/Collapse */}
          {evidenceData.description && (
            <Card className="p-8 bg-muted/30">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {isDescriptionExpanded || evidenceData.description.length <= 300
                  ? evidenceData.description
                  : `${evidenceData.description.slice(0, 300)}...`}
              </p>
              {evidenceData.description.length > 300 && (
                <Button
                  variant="ghost"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-4 text-primary hover:text-primary/80"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Photos & Videos */}
        {evidenceData.photos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Photos & Videos ({evidenceData.photos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evidenceData.photos.map((photo, index) => (
                <Card
                  key={photo.path}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => handleMediaClick(index, photo.url, photo.name)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {isVideo(photo.name) ? (
                      <>
                        <video
                          src={photo.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-white/90 rounded-full p-4">
                            <Play className="h-8 w-8 text-primary" fill="currentColor" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                          Video
                        </Badge>
                      </>
                    ) : (
                      <img
                        src={photo.url}
                        alt={photo.label || evidenceData.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    
                    {/* View Comments Button */}
                    <div className="absolute bottom-2 right-2 z-10">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/70 backdrop-blur hover:bg-black/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(photo);
                          setPhotoCommentsOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {photoCommentCounts?.[photo.captionId] > 0 && (
                          <span className="ml-1">({photoCommentCounts[photo.captionId]})</span>
                        )}
                      </Button>
                    </div>
                  </div>
                  {(photo.label || photo.caption) && (
                    <div className="p-4 space-y-2">
                      {photo.label && (
                        <h3 className="font-semibold text-foreground">
                          {photo.label}
                        </h3>
                      )}
                      {photo.caption && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection evidenceId={id!} />
      </div>

      {/* Video Player */}
      <VideoPlayerDialog
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        videoUrl={currentVideoUrl}
        videoName={currentVideoName}
      />

      {/* Photo Comments Dialog */}
      <PhotoCommentsDialog
        photo={selectedPhoto}
        evidenceId={id!}
        open={photoCommentsOpen}
        onOpenChange={setPhotoCommentsOpen}
      />
    </Layout>
  );
}
