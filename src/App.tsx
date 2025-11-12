import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import UploadEvidence from "./pages/UploadEvidence";
import SubmitClaim from "./pages/SubmitClaim";
import RedrowDefects from "./pages/RedrowDefects";
import RedrowComplaints from "./pages/RedrowComplaints";
import ComplaintsDatabase from "./pages/ComplaintsDatabase";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import AdminFAQManagement from "./pages/AdminFAQManagement";
import AdminSettings from "./pages/AdminSettings";
import PublicGallery from "./pages/PublicGallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Developments from "./pages/Developments";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminVisitorStatistics from "./pages/AdminVisitorStatistics";
import AdminEmailManagement from "./pages/AdminEmailManagement";
import MyEvidence from "./pages/MyEvidence";
import MyClaims from "./pages/MyClaims";
import MyProfile from "./pages/MyProfile";
import GroupLitigationInfo from "./pages/GroupLitigationInfo";
import EvidenceDetail from "./pages/EvidenceDetail";
import AdminCommentModeration from "./pages/AdminCommentModeration";
import NewsArticles from "./pages/NewsArticles";
import AdminArticles from "./pages/AdminArticles";
import Socials from "./pages/Socials";
import AdminSocials from "./pages/AdminSocials";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/submit-claim" element={<SubmitClaim />} />
            <Route path="/group-litigation-info" element={<GroupLitigationInfo />} />
            <Route path="/redrow-defects" element={<RedrowDefects />} />
            <Route path="/redrow-complaints" element={<RedrowComplaints />} />
            <Route path="/complaints-database" element={<ComplaintsDatabase />} />
            <Route path="/upload-evidence" element={<UploadEvidence />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/developments" element={<Developments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/my-evidence" element={<MyEvidence />} />
            <Route path="/my-claims" element={<MyClaims />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/faqs" element={<AdminFAQManagement />} />
            <Route path="/admin/visitor-statistics" element={<AdminVisitorStatistics />} />
            <Route path="/admin/emails" element={<AdminEmailManagement />} />
            <Route path="/admin/comments" element={<AdminCommentModeration />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/socials" element={<AdminSocials />} />
            <Route path="/public-gallery" element={<PublicGallery />} />
            <Route path="/news-articles" element={<NewsArticles />} />
            <Route path="/socials" element={<Socials />} />
            <Route path="/evidence/:id" element={<EvidenceDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
