import { Share2, Twitter, Linkedin, MessageCircle, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

const SocialShareButtons = ({ url, title, description }: SocialShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description.slice(0, 100)) : "";

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Evidence link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook', shareLinks.facebook)}
        aria-label="Share on Facebook"
      >
        <Share2 className="h-4 w-4" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter', shareLinks.twitter)}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin', shareLinks.linkedin)}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
};

export default SocialShareButtons;
