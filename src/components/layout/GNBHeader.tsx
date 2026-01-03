import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/constants/haetae';
import { Bell, LogOut, User, Home, FileText, Mail, Package, ClipboardCheck, Briefcase, AlertTriangle, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/ui/Logo';

const NAV_ITEMS = [
  // { path: '/', label: '대시보드', icon: Home }, // Removed as per request (Title acts as home link)
  { path: '/incidents', label: '재난 현황', icon: AlertTriangle },
  { path: '/mypage', label: '개인정보', icon: User },
  { path: '/notices', label: '공지사항', icon: FileText },
  { path: '/messages', label: '쪽지함', icon: Mail },
  { path: '/resources', label: '업무지원', icon: Package },
  { path: '/approvals', label: '결재', icon: ClipboardCheck },
  { path: '/tasks', label: '담당업무', icon: Briefcase },
];

import { useInteraction } from '@/contexts/InteractionContext';
import { useState, useEffect } from 'react';

export function GNBHeader() {
  const { agent, logout } = useAuth();
  const { isTriggered, isRead } = useInteraction();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showNoticeBadge = isTriggered('noti-sinkhole-alert');

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  return (
    <header className="h-16 bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-40">
      <div className="h-full px-4 flex items-center justify-between max-w-[1920px] mx-auto">
        {/* 좌측: 모바일 메뉴 + 로고 */}
        <div className="flex items-center gap-3">
          {/* 모바일 메뉴 버튼 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10 p-2"
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Logo />
                  <span className="font-bold">초자연재난관리국</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-colors
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.path === '/notices' && showNoticeBadge && !isRead('noti-sinkhole-alert') && (
                        <span className="ml-auto w-2 h-2 bg-destructive rounded-full animate-pulse" aria-label="새 알림" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* 태극 문양 + 타이틀 (클릭 시 홈 이동) */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity py-2">
            <div className="w-8 h-8">
              <Logo />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-base sm:text-lg leading-tight tracking-tight">초자연재난관리국</span>
            </div>
          </Link>
        </div>

        {/* 중앙: 네비게이션 */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3 py-2 text-sm font-medium rounded-sm transition-colors relative
                  ${isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }
                `}
              >
                <item.icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                {item.label}
                {item.path === '/notices' && showNoticeBadge && !isRead('noti-sinkhole-alert') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 우측: 사용자 정보 */}
        <div className="flex items-center gap-3">
          {/* 부서 표시 */}
          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${deptInfo.bgClass}`}>
            <deptInfo.icon className="w-4 h-4" />
            <span>{deptInfo.name} <span className="hidden md:inline">({deptInfo.fullName})</span></span>
          </div>

          {/* 알림 */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10 relative"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* 사용자 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-2 max-w-[200px] h-10"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate">{agent.name}</span>
                <span className="text-xs opacity-70 shrink-0">({agent.rank})</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/mypage" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  개인정보
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
