import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import motorwayBanner from "@/assets/motorway-banner.jpg";

const UploadEvidence = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhoto = async (file: File, userId: string, evidenceId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${evidenceId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('evidence-photos')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

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
      // Check if user is authenticated
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

      if (evidenceError) {
        throw evidenceError;
      }

      // Upload photos if any
      if (photos.length > 0) {
        const uploadPromises = photos.map(photo => 
          uploadPhoto(photo, user.id, evidence.id)
        );
        
        await Promise.all(uploadPromises);
      }

      toast({
        title: "Evidence submitted successfully",
        description: `Your evidence "${title}" has been uploaded with ${photos.length} photo(s).`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("");
      setPhotos([]);
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

  return (
    <Layout>
      {/* Banner Image */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={motorwayBanner} 
          alt="RedrowExposed.co.uk banner over UK motorway bridge - A public interest website"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the issue, when you noticed it, any repairs attempted, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Photo Evidence</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ImageIcon className="h-12 w-12" />
                      <div>
                        <p className="text-lg font-medium">Upload Photos</p>
                        <p className="text-sm">Click to select multiple images (max 10MB each)</p>
                      </div>
                    </label>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Evidence photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {photo.name}
                          </p>
                        </div>
                      ))}
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