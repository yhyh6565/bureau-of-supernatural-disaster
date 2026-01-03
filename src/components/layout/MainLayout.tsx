import { ReactNode } from 'react';
import { GNBHeader } from './GNBHeader';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { agent } = useAuth();

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
      <main id="main-content" className="p-4 lg:p-6 max-w-[1920px] mx-auto pb-4 lg:pb-10">
        {children}
      </main>

      {/* 하단 정보 바 */}
      <footer className="lg:fixed bottom-0 left-0 right-0 h-8 bg-muted border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground z-30">
        <div className="flex items-center gap-4">
          <span>접속자: {agent?.name}</span>
          <span className="font-mono">{new Date().toLocaleDateString('ko-KR')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>시스템 정상</span>
        </div>
      </footer>
    </div>
  );
}
