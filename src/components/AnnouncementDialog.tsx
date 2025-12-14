import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Megaphone, Handshake, ClipboardList, Bell, Newspaper, Wrench, Database, Tv } from "lucide-react";

const STORAGE_KEY = "announcement-dismissed-v1";

export function AnnouncementDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this announcement before
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="h-8 w-8 text-primary" />
            Standing Strong for Homeowner Rights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Important Notice Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
              <Scale className="h-5 w-5" />
              Important Notice
            </div>
            <div className="pl-7 space-y-2 text-muted-foreground">
              <p>
                Redrow Homes have instructed solicitors in an attempt to force us to take this website down.
              </p>
              <p className="font-semibold text-foreground text-lg">
                We will not be deterred.
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Our Commitment Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <span className="text-xl">✊</span>
              Our Commitment to You
            </div>
            <p className="pl-7 text-muted-foreground">
              This platform was created to serve the <span className="font-semibold text-foreground">public interest</span> by:
            </p>
            <ul className="pl-7 space-y-2">
              <li className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span><span className="font-medium">Informing potential buyers</span> about issues others have faced with Redrow properties</span>
              </li>
              <li className="flex items-start gap-3">
                <Handshake className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span><span className="font-medium">Helping homeowners</span> resolve defects and build quality problems</span>
              </li>
              <li className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span><span className="font-medium">Documenting evidence</span> to support those seeking accountability</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-border" />

          {/* What's Coming Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-amber-600 dark:text-amber-500">
              <Bell className="h-5 w-5" />
              What's Coming Next
            </div>
            <p className="pl-7 text-muted-foreground">
              Watch this space! In the coming days we'll be publishing:
            </p>
            <ul className="pl-7 space-y-2">
              <li className="flex items-start gap-3">
                <Newspaper className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <span><span className="font-medium">New evidence and stories</span> from affected homeowners</span>
              </li>
              <li className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <span><span className="font-medium">Enhanced features</span> to capture and centralise customer experiences</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <span><span className="font-medium">A single source of truth</span> platform for Redrow property issues</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-border" />

          {/* Media Attention Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
              <Tv className="h-5 w-5" />
              Media Attention
            </div>
            <p className="pl-7 text-muted-foreground">
              The recent threat of legal action and attempt to silence homeowner voices is a story 
              that deserves to be told. We will be reporting these developments to various media outlets including:
            </p>
            <ul className="pl-7 space-y-2">
              <li className="flex items-start gap-3">
                <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">News outlets already covering Redrow issues</span>
                  <Link to="/news-articles" onClick={handleDismiss}>
                    <Button variant="outline" size="sm" className="h-7">
                      View News Articles →
                    </Button>
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Tv className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span><span className="font-medium">Sky News</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Tv className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span><span className="font-medium">BBC</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Tv className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span><span className="font-medium">ITV</span></span>
              </li>
              <li className="flex items-start gap-3">
                <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span><span className="font-medium">The Comet Newspaper</span></span>
              </li>
            </ul>
          </div>

          <div className="border-t border-border" />

          {/* Footer Message */}
          <p className="text-center text-lg font-semibold text-primary">
            Together, we are stronger. Your voice matters.
          </p>

          <Button onClick={handleDismiss} className="w-full" size="lg">
            Continue to Site →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
