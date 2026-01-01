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
      <GNBHeader />
      
      {/* 워터마크 제거됨 */}
      
      {/* 메인 콘텐츠 */}
      <main className="p-4 lg:p-6 max-w-[1920px] mx-auto">
        {children}
      </main>

      {/* 하단 정보 바 */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-muted border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
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
