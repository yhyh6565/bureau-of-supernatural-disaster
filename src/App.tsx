import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useBureauStore } from "@/store/bureauStore";
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
import { EggManager } from "@/components/common/EggManager";
import { ResourceProvider } from "@/contexts/ResourceContext";
import { WorkProvider } from "@/contexts/WorkContext";
import { UserProvider } from "@/contexts/UserContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
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

// Wrapper to handle Bureau Mode theme
function BureauThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useBureauStore();

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 브라우저 뒤로가기 시, 세광 모드였다면 일반 모드로 복귀
      if (mode === 'segwang') {
        setMode('ordinary');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mode, setMode]);

  return (
    <div className={mode === 'segwang' ? 'segwang-theme' : ''}>
      {children}
      {mode === 'segwang' && (
        <style>{`
                    .segwang-theme {
                        /* 1. 기본 색상 재정의 (가독성 확보 + 녹슨 분위기) */
                        --background: 0 10% 8%; /* #161212 - 아주 어두운 붉은 검정 */
                        --foreground: 30 20% 85%; /* #e0dcd9 - 탁한 종이색 */
                        
                        --muted: 0 10% 12%; 
                        --muted-foreground: 0 10% 60%;
                        
                        --card: 0 10% 9%;
                        --card-foreground: 30 20% 85%;
                        
                        --popover: 0 10% 9%;
                        --popover-foreground: 30 20% 85%;
                        
                        --border: 0 20% 25%; /* 붉은 끼가 도는 어두운 테두리 */
                        --input: 0 20% 20%;
                        
                        --primary: 0 50% 40%; /* #993333 - 말라붙은 핏빛 */
                        --primary-foreground: 0 0% 90%;
                        
                        --secondary: 150 10% 15%; /* #222926 - 짙은 녹조색 */
                        --secondary-foreground: 150 10% 80%;
                        
                        --accent: 0 30% 20%;
                        --accent-foreground: 30 20% 90%;
                        
                        --destructive: 0 80% 40%; /* 더 어두운 파괴색 */
                        --destructive-foreground: 0 0% 100%;

                        --ring: 0 50% 40%;
                        
                        /* 2. 분위기 필터 (기존 색상 위에 적녹이 얹혀진 느낌) */
                        position: relative;
                        overflow-x: hidden;
                    }
                    
                    /* 3. 레이어드 오버레이 (Rust & Blood Overlay) */
                    .segwang-theme::after {
                        content: "";
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 9999;
                        
                        /* 비네팅 + 붉은 녹/핏자국 그라데이션 */
                        background: 
                            radial-gradient(circle at center, transparent 0%, rgba(30, 10, 5, 0.4) 100%),
                            linear-gradient(to bottom, rgba(50, 10, 0, 0.1), rgba(10, 20, 10, 0.2));
                        
                        mix-blend-mode: multiply; /* 기존 색상을 덮으면서 어둡고 탁하게 만듦 */
                    }

                    /* 4. 스크롤바 커스텀 */
                    .segwang-theme ::-webkit-scrollbar-thumb {
                        background: #4a3b3b;
                        border-radius: 2px;
                    }
                    .segwang-theme ::-webkit-scrollbar-track {
                        background: #1a1212;
                    }

                    /* 5. 텍스트 선택 색상 */
                    .segwang-theme ::selection {
                        background: #8a2c2c; /* 핏빛 드래그 */
                        color: #ffffff;
                    }

                    /* 6. 미세한 노이즈 효과 (선택적) */
                    .segwang-theme::before {
                        content: "";
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 9998;
                        opacity: 0.05;
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    }
                `}</style>
      )}
    </div>
  );
}



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <BureauThemeWrapper>
          <UserProvider>
            <WorkProvider>
              <ResourceProvider>
                <ContaminationGameOver />
                <EggManager />
                <AppRoutes />
              </ResourceProvider>
            </WorkProvider>
          </UserProvider>
        </BureauThemeWrapper>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
