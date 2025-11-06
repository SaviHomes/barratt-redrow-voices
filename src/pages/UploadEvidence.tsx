import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, AlertCircle, Video, ArrowUp, ArrowDown, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import motorwayBanner from "@/assets/motorway-banner.jpg";
import BackToDashboard from "@/components/BackToDashboard";

interface PhotoWithMetadata {
  file: File;
  preview: string;
  label: string;
  description: string;
  orderIndex: number;
  type: 'image' | 'video';
}

interface PhotoCardProps {
  item: PhotoWithMetadata;
  index: number;
  onUpdate: (index: number, updates: Partial<PhotoWithMetadata>) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const PhotoCard = ({ item, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: PhotoCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {item.type === 'image' ? (
              <img src={item.preview} className="w-24 h-24 object-cover rounded-md" alt={`Preview ${index + 1}`} />
            ) : (
              <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.type === 'image' ? 'Photo' : 'Video'} {index + 1}</Badge>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.file.name}</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMoveUp(index)} 
                  disabled={isFirst}
                  title="Move up"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMoveDown(index)} 
                  disabled={isLast}
                  title="Move down"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(index)}
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`label-${index}`}>Label / Room Name</Label>
              <Input
                id={`label-${index}`}
                placeholder="e.g., Kitchen, Master Bedroom, Living Room"
                value={item.label}
                onChange={(e) => onUpdate(index, { label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${index}`}>What's in this {item.type}?</Label>
              <Textarea
                id={`description-${index}`}
                placeholder="Describe what this image/video shows - the defect, damage, or issue..."
                value={item.description}
                onChange={(e) => onUpdate(index, { description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UploadEvidence = () => {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [photoFiles, setPhotoFiles] = useState<PhotoWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidType = isImage || isVideo;
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be an image or video file.`,
          variant: "destructive",
        });
        return false;
      }

      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      const isValidSize = file.size <= maxSize;
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${isVideo ? '50MB' : '10MB'} limit.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      label: '',
      description: '',
      orderIndex: photoFiles.length + index,
      type: (file.type.startsWith('image/') ? 'image' : 'video') as 'image' | 'video'
    }));

    setPhotoFiles(prev => [...prev, ...newFiles]);
  };

  const updatePhotoMetadata = (index: number, updates: Partial<PhotoWithMetadata>) => {
    setPhotoFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return newFiles.map((item, i) => ({ ...item, orderIndex: i }));
    });
  };

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    setPhotoFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles.map((item, i) => ({ ...item, orderIndex: i }));
    });
  };

  const movePhotoDown = (index: number) => {
    if (index === photoFiles.length - 1) return;
    setPhotoFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles.map((item, i) => ({ ...item, orderIndex: i }));
    });
  };

  const uploadFile = async (file: File, userId: string, evidenceId: string) => {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${evidenceId}/${timestamp}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('evidence-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category || !severity) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit evidence.",
          variant: "destructive",
        });
        return;
      }

      // Create evidence record
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      // Upload files and create captions
      if (photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const item = photoFiles[i];
          
          // Upload file
          const filePath = await uploadFile(item.file, user.id, evidence.id);
          
          // Create caption record
          const { error: captionError } = await supabase
            .from('evidence_photo_captions')
            .insert({
              evidence_id: evidence.id,
              photo_path: filePath,
              label: item.label.trim(),
              caption: item.description.trim(),
              order_index: item.orderIndex,
            });

          if (captionError) throw captionError;
        }
      }

      toast({
        title: "Evidence submitted successfully",
        description: `Your evidence "${title}" has been uploaded with ${photoFiles.length} file(s).`,
      });

      // Cleanup and reset
      photoFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setPhotoFiles([]);
      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading your evidence.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to submit evidence. Please create an account or sign in to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/register">Create Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <img 
          src={motorwayBanner} 
          alt="RedrowExposed.co.uk banner over UK motorway bridge - A public interest website"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {user && <BackToDashboard />}
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              Confidential & Secure
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Submit Your Evidence
            </h1>
            <p className="text-lg text-muted-foreground">
              Help build a comprehensive database of quality issues by sharing your photographic evidence and case details.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Evidence Submission Form
              </CardTitle>
              <CardDescription>
                All submissions are securely stored and only visible to you unless you choose to share them publicly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Evidence Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Main Evidence Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Evidence Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Crack in bedroom ceiling"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="structural">Structural Issues</SelectItem>
                          <SelectItem value="electrical">Electrical Problems</SelectItem>
                          <SelectItem value="plumbing">Plumbing Issues</SelectItem>
                          <SelectItem value="finishing">Poor Finishing</SelectItem>
                          <SelectItem value="external">External/Landscaping</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity Level *</Label>
                    <Select value={severity} onValueChange={setSeverity} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Cosmetic issues</SelectItem>
                        <SelectItem value="medium">Medium - Noticeable problems</SelectItem>
                        <SelectItem value="high">High - Significant issues</SelectItem>
                        <SelectItem value="critical">Critical - Safety concerns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Overall Description</Label>
                    <p className="text-sm text-muted-foreground">
                      Provide general context for your entire evidence submission. You can add specific descriptions for each photo/video below.
                    </p>
                    <Textarea
                      id="description"
                      placeholder="Provide an overview of the issue, when you noticed it, any repairs attempted, etc."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Photos & Videos Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Photos & Videos</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add photos or videos and describe each one individually
                      </p>
                    </div>
                    {photoFiles.length > 0 && (
                      <Badge variant="secondary">
                        {photoFiles.length} file{photoFiles.length !== 1 ? 's' : ''} uploaded
                      </Badge>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                      <Upload className="h-6 w-6" />
                      <div className="text-center">
                        <p className="font-medium">Add Photos or Videos</p>
                        <p className="text-sm">Images (max 10MB) • Videos (max 50MB)</p>
                      </div>
                    </label>
                  </div>

                  {/* Photo/Video Cards */}
                  {photoFiles.length > 0 ? (
                    <div className="space-y-3">
                      {photoFiles.map((item, index) => (
                        <PhotoCard
                          key={index}
                          item={item}
                          index={index}
                          onUpdate={updatePhotoMetadata}
                          onRemove={removePhoto}
                          onMoveUp={movePhotoUp}
                          onMoveDown={movePhotoDown}
                          isFirst={index === 0}
                          isLast={index === photoFiles.length - 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No files uploaded yet</p>
                      <p className="text-sm">Click the button above to add photos or videos</p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Privacy & Security Notice:</p>
                    <p>Your evidence is stored securely and privately. Only you can access your submissions unless you explicitly choose to share them. We never share personal information without consent.</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={uploading || !title.trim() || !category || !severity}
                  className="w-full md:w-auto"
                >
                  {uploading ? "Uploading..." : "Submit Evidence"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
};

export default UploadEvidence;
