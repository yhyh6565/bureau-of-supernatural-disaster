import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/types/haetae';
import { Bell, LogOut, User, Home, FileText, Mail, MapPin, Package, ClipboardCheck, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  { path: '/', label: '대시보드', icon: Home },
  { path: '/mypage', label: '개인정보', icon: User },
  { path: '/notices', label: '공지사항', icon: FileText },
  { path: '/messages', label: '쪽지함', icon: Mail },
  { path: '/visits', label: '방문신청', icon: MapPin },
  { path: '/equipment', label: '장비/서비스', icon: Package },
  { path: '/approvals', label: '결재', icon: ClipboardCheck },
  { path: '/tasks', label: '담당업무', icon: Briefcase },
];

export function GNBHeader() {
  const { agent, logout } = useAuth();
  const location = useLocation();

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  return (
    <header className="h-16 bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-40">
      <div className="h-full px-4 flex items-center justify-between max-w-[1920px] mx-auto">
        {/* 좌측: 로고 */}
        <div className="flex items-center gap-3">
          {/* 태극 문양 대체 */}
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-xl">
            🦁
          </div>
          <div className="flex flex-col">
            <span className="text-xs opacity-80">환경부</span>
            <span className="font-bold text-sm">초자연재난관리국</span>
          </div>
          <div className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs font-mono">
            해태 v1.0
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
                  px-3 py-2 text-sm font-medium rounded-sm transition-colors
                  ${isActive 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }
                `}
              >
                <item.icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측: 사용자 정보 */}
        <div className="flex items-center gap-3">
          {/* 부서 표시 */}
          <div className={`px-2 py-1 rounded text-xs font-medium bg-${deptInfo.colorClass}/20`}>
            {deptInfo.icon} {deptInfo.name} ({deptInfo.fullName})
          </div>

          {/* 알림 */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* 사용자 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-2"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{agent.name}</span>
                <span className="text-xs opacity-70">({agent.rank})</span>
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
