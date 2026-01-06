import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ResourceProvider } from "@/contexts/ResourceContext";
import { InteractionProvider } from "@/contexts/InteractionContext";
import { WorkProvider } from "@/contexts/WorkContext";
import { BureauProvider } from "@/contexts/BureauContext";
import { LoginPage } from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import MyPage from "@/pages/MyPage";
import NoticesPage from "@/pages/NoticesPage";
import NoticeDetailPage from "@/pages/NoticeDetailPage";
import MessagesPage from "@/pages/MessagesPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import TasksPage from "@/pages/TasksPage";
import IncidentsPage from "@/pages/IncidentsPage";
import ManualsPage from "@/pages/ManualsPage";
import NotFound from "./pages/NotFound";
import { ContaminationGameOver } from "@/components/common/ContaminationGameOver";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><NoticesPage /></ProtectedRoute>} />
      <Route path="/notices/:id" element={<ProtectedRoute><NoticeDetailPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/manuals" element={<ProtectedRoute><ManualsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <BureauProvider>
            <UserProvider>
              <ResourceProvider>
                <InteractionProvider>
                  <WorkProvider>
                    <ContaminationGameOver />
                    <AppRoutes />
                  </WorkProvider>
                </InteractionProvider>
              </ResourceProvider>
            </UserProvider>
          </BureauProvider>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
