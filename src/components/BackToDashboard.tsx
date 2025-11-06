import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackToDashboard() {
  return (
    <Button asChild variant="ghost" className="mb-6">
      <Link to="/user-dashboard" className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  );
}
