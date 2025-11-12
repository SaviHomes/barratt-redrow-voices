import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EvidencePhoto {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  caption?: string;
  label?: string;
  captionId?: string;
}

export interface EvidenceWithPhotos {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  created_at: string;
  user_id: string;
  photos: EvidencePhoto[];
  is_public?: boolean;
  view_count?: number;
  featured_image_index?: number;
}

export function useEvidencePhotos(evidence: any[], userId: string | undefined) {
  const [evidenceWithPhotos, setEvidenceWithPhotos] = useState<EvidenceWithPhotos[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || evidence.length === 0) {
      setEvidenceWithPhotos(evidence.map(e => ({ ...e, photos: [] })));
      return;
    }

    fetchPhotosForEvidence();
  }, [evidence, userId]);

  const fetchPhotosForEvidence = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch captions for all evidence items
      const evidenceIds = evidence.map(e => e.id);
      const { data: captions } = await supabase
        .from('evidence_photo_captions')
        .select('*')
        .in('evidence_id', evidenceIds)
        .order('order_index', { ascending: true });

      const evidenceWithPhotosData = evidence.map((item) => {
        // Get captions for this evidence item
        const itemCaptions = captions?.filter(c => c.evidence_id === item.id) || [];
        
        // Build photos array from captions
        const photos: EvidencePhoto[] = itemCaptions.map((captionData) => {
          const { data } = supabase.storage
            .from('evidence-photos')
            .getPublicUrl(captionData.photo_path);

          // Extract filename from path
          const filename = captionData.photo_path.split('/').pop() || '';

          return {
            name: filename,
            path: captionData.photo_path,
            url: data.publicUrl,
            size: 0, // We don't have size from captions, but it's not critical
            created_at: captionData.created_at,
            caption: captionData.caption,
            label: captionData.label,
            captionId: captionData.id,
          };
        });

        return { ...item, photos };
      });

      setEvidenceWithPhotos(evidenceWithPhotosData);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setEvidenceWithPhotos(evidence.map(e => ({ ...e, photos: [] })));
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (evidenceId: string, photoPath: string) => {
    try {
      const { error } = await supabase.storage
        .from('evidence-photos')
        .remove([photoPath]);

      if (error) throw error;

      // Update local state
      setEvidenceWithPhotos(prev =>
        prev.map(item =>
          item.id === evidenceId
            ? { ...item, photos: item.photos.filter(p => p.path !== photoPath) }
            : item
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { success: false, error };
    }
  };

  return {
    evidenceWithPhotos,
    loading,
    deletePhoto,
    refetch: fetchPhotosForEvidence,
  };
}
