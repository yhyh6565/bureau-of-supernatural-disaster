import { ReactNode, useState } from 'react';
import { GNBHeader } from './GNBHeader';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';
import { ExitConfirmModal } from '@/components/segwang/ExitConfirmModal';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { agent } = useAuthStore();
  const { mode, setMode } = useBureauStore();
  const [showExitModal, setShowExitModal] = useState(false);

  const handleExitSaekwang = () => {
    setMode('ordinary');
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        본문으로 건너뛰기
      </a>

      <GNBHeader />

      {/* 워터마크 제거됨 */}

      {/* 메인 콘텐츠 */}
      <main id="main-content" className="p-4 lg:p-6 max-w-[1920px] mx-auto pb-12 lg:pb-16 min-h-[calc(100vh-32px)]">
        {children}
      </main>

      {/* 하단 정보 바 */}
      <footer className={`fixed bottom-0 left-0 right-0 h-8 border-t px-4 flex items-center justify-between text-xs z-50 ${mode === 'segwang'
          ? 'bg-red-950/30 border-red-900 text-red-500 font-mono'
          : 'bg-muted border-border text-muted-foreground'
        }`}>
        <div className="flex items-center gap-4">
          {mode === 'segwang' ? (
            <>
              <span className="font-bold">세광특별시 지부</span>
              <span className="font-mono opacity-70">마지막 백업: 20██.05.04 23:47</span>
            </>
          ) : (
            <>
              <span>접속자: {agent?.name}</span>
              <span className="font-mono">{new Date().toLocaleDateString('ko-KR')}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mode === 'segwang' ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/50"
              onClick={() => setShowExitModal(true)}
            >
              <Power className="w-3 h-3 mr-1" />
              접속 종료
            </Button>
          ) : (
            <>
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>시스템 정상</span>
            </>
          )}
        </div>
      </footer>

      {/* 세광 모드 종료 확인 모달 */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitSaekwang}
      />
    </div>
  );
}
