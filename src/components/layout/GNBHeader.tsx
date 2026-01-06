import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useBureau } from '@/contexts/BureauContext';
import { DEPARTMENT_INFO } from '@/constants/haetae';
import { Bell, LogOut, User, Home, FileText, Mail, Package, ClipboardCheck, Briefcase, AlertTriangle, Menu, Book } from 'lucide-react';
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
  { path: '/manuals', label: '재난 매뉴얼', icon: Book },
  { path: '/tasks', label: '담당업무', icon: Briefcase },
  { path: '/notices', label: '공지사항', icon: FileText },
  { path: '/approvals', label: '결재', icon: ClipboardCheck },
  { path: '/messages', label: '쪽지함', icon: Mail },
  { path: '/resources', label: '업무지원', icon: Package },
  { path: '/mypage', label: '개인정보', icon: User },
];

import { useInteraction } from '@/contexts/InteractionContext';
import { useState, useEffect } from 'react';

export function GNBHeader() {
  const { agent, logout } = useAuth();
  const { isTriggered, isRead } = useInteraction();
  const { contamination } = useUser();
  const { mode } = useBureau();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'segwang') {
      const toggleGlitch = () => {
        setIsGlitching(prev => !prev);
      };
      // 2초마다 텍스트 변경 (2초 유지)
      interval = setInterval(toggleGlitch, 2000);
    } else {
      setIsGlitching(false);
    }
    return () => clearInterval(interval);
  }, [mode]);

  const showNoticeBadge = isTriggered('noti-sinkhole-alert');

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  const isSegwang = mode === 'segwang';
  const redact = (text: string) => text.split('').map(() => '■').join('');

  const displayedName = isSegwang ? redact(agent.name) : agent.name;
  const displayedRank = isSegwang ? redact(agent.rank) : agent.rank;
  const displayedDeptName = isSegwang ? redact(deptInfo.name) : deptInfo.name;
  const displayedDeptFullName = isSegwang ? redact(deptInfo.fullName) : deptInfo.fullName;
  const displayedContamination = isSegwang ? 100 : Math.round(contamination);

  // 로고 텍스트 로직
  const standardLogoText = "초자연재난관리국";
  const segregatedLogoText = "세■■별시 지부";

  const currentLogoText = (isSegwang && isGlitching) ? segregatedLogoText : standardLogoText;
  const logoClass = (isSegwang && isGlitching) ? "glitch text-destructive tracking-widest" : "font-black tracking-tight";

  return (
    <header className="h-14 bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-40">
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
                <SheetTitle className="flex">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Logo className="w-12 h-12" />
                    <span
                      className={`font-bold ${logoClass}`}
                      data-text={currentLogoText}
                    >
                      {currentLogoText}
                    </span>
                  </Link>
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
            <div className="w-7 h-7 md:w-8 md:h-8">
              <Logo />
            </div>
            <div className="hidden md:flex flex-col justify-center w-[160px]">
              <span
                className={`text-base sm:text-lg leading-tight ${logoClass}`}
                data-text={currentLogoText}
              >
                {currentLogoText}
              </span>
            </div>
          </Link>

          {/* Mobile Display: Dept & Contamination (Next to Logo) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className={`px-1.5 py-0.5 rounded text-sm font-medium flex items-center gap-1.5 ${deptInfo.bgClass}`}>
              <deptInfo.icon className="w-3.5 h-3.5" />
              <span>{displayedDeptName}</span>
            </div>
            <div className="flex items-center justify-center h-auto py-0.5 min-w-[2rem] px-1.5 font-mono font-bold text-xs text-destructive bg-destructive/10 rounded">
              오염 : {displayedContamination}%
            </div>
          </div>
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
                  px-2 py-2 text-sm font-medium rounded-sm transition-colors relative whitespace-nowrap
                  ${isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }
                `}
              >
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
          {/* 부서 표시 (Desktop) */}
          <div className={`hidden md:flex px-2 py-1 rounded text-xs font-medium items-center gap-1.5 ${deptInfo.bgClass}`}>
            <deptInfo.icon className="w-4 h-4" />
            <span>{displayedDeptName} <span>({displayedDeptFullName})</span></span>
          </div>

          {/* 정신오염도 표시 (Desktop) */}
          <div className="hidden md:flex items-center justify-center h-10 min-w-[3rem] px-2 font-mono font-bold text-[15px] text-destructive bg-destructive/10 rounded">
            오염도 : {displayedContamination}%
          </div>

          {/* 사용자 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-2 max-w-[200px] h-10"
              >
                <User className="hidden md:block w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate">{displayedName}</span>
                <span className="text-xs opacity-70 shrink-0">({displayedRank})</span>
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
