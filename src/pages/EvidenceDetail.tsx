import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEvidencePhotos, EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayerDialog } from "@/components/evidence/VideoPlayerDialog";

export default function EvidenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentVideoName, setCurrentVideoName] = useState("");

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
  
  const { evidenceWithPhotos } = useEvidencePhotos(evidenceArray, evidence?.user_id);
  const evidenceData: EvidenceWithPhotos | undefined = evidenceWithPhotos[0];

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

          {/* Full Description */}
          {evidenceData.description && (
            <Card className="p-8 bg-muted/30">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {evidenceData.description}
              </p>
            </Card>
          )}
        </div>

        {/* Photos & Videos */}
        {evidenceData.photos.length > 0 && (
          <div>
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
      </div>

      {/* Video Player */}
      <VideoPlayerDialog
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        videoUrl={currentVideoUrl}
        videoName={currentVideoName}
      />
    </Layout>
  );
}
