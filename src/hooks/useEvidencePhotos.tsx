import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EvidencePhoto {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
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
      const evidenceWithPhotosData = await Promise.all(
        evidence.map(async (item) => {
          const { data: files, error } = await supabase.storage
            .from('evidence-photos')
            .list(`${userId}/${item.id}`);

          if (error || !files || files.length === 0) {
            return { ...item, photos: [] };
          }

          const photos: EvidencePhoto[] = await Promise.all(
            files
              .filter(file => file.name !== '.emptyFolderPlaceholder')
              .map(async (file) => {
                const path = `${userId}/${item.id}/${file.name}`;
                const { data } = supabase.storage
                  .from('evidence-photos')
                  .getPublicUrl(path);

                return {
                  name: file.name,
                  path: path,
                  url: data.publicUrl,
                  size: file.metadata?.size || 0,
                  created_at: file.created_at || new Date().toISOString(),
                };
              })
          );

          return { ...item, photos };
        })
      );

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
