import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Features
            </a>
            <a 
              href="/upload-evidence" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Upload Evidence
            </a>
            <a 
              href="#community" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Community
            </a>
            <a 
              href="#contact" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Contact
            </a>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}