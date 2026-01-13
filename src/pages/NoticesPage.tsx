import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DataManager } from '@/data/dataManager';
import { useAuthStore } from '@/store/authStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useBureauStore } from '@/store/bureauStore';
import segwangNotices from '@/data/segwang/notices.json';
import { parseNotificationDate, safeFormatDate, formatSegwangDate } from '@/utils/dateUtils';
import {
  Notification,
  NoticePriority,
  NoticeCategory,
  NoticeDepartment,
} from '@/types/haetae';
import { NOTICE_PRIORITY_STYLE, NOTICE_CATEGORY_STYLE } from '@/constants/haetae';
import { Bell, Search, Pin, ChevronDown, Filter } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NoticesPage() {
  const { agent } = useAuthStore();
  const { triggeredIds, triggeredTimestamps } = useInteractionStore();
  const { mode } = useBureauStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<NoticePriority[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<NoticeCategory[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<NoticeDepartment[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 공지사항 데이터
  const baseNotices = mode === 'segwang' ? segwangNotices : DataManager.getNotifications(agent);
  const allNotices = baseNotices.map(n => {
    // If this notification was dynamically triggered, override its createdAt with the trigger timestamp
    if (n.trigger && triggeredTimestamps && triggeredTimestamps[n.id]) {
      return { ...n, createdAt: triggeredTimestamps[n.id] };
    }
    return n;
  });

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 필터링 로직
  const filteredNotices = allNotices
    .filter(notice => {
      // 검색어 필터
      const matchesSearch =
        searchTerm === '' ||
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase());

      // 긴급도 필터
      const matchesPriority =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(notice.priority);

      // 카테고리 필터
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(notice.category);

      // 부서 필터
      const matchesDepartment =
        selectedDepartments.length === 0 ||
        selectedDepartments.includes(notice.sourceDepartment);

      // 읽지 않음 필터
      const matchesUnread = !showUnreadOnly || !notice.isRead;

      // Trigger 필터
      const isVisible = !notice.trigger || triggeredIds.includes(notice.id);

      return matchesSearch && matchesPriority && matchesCategory && matchesDepartment && matchesUnread && isVisible;
    })
    .sort((a, b) => {
      // 상단 고정 우선
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 날짜 역순
      return parseNotificationDate(b.createdAt).getTime() - parseNotificationDate(a.createdAt).getTime();
    });

  const togglePriority = (priority: NoticePriority) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleCategory = (category: NoticeCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleDepartment = (dept: NoticeDepartment) => {
    setSelectedDepartments(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const isNewNotice = (createdAt: Date | string) => {
    const date = typeof createdAt === 'string' ? parseNotificationDate(createdAt) : createdAt;
    return differenceInDays(new Date(), date) <= 1;
  };


  const activeFilterCount =
    selectedPriorities.length +
    selectedCategories.length +
    selectedDepartments.length +
    (showUnreadOnly ? 1 : 0);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header & Search Area */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            공지사항
          </h1>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative flex-1 md:flex-none md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="제목 또는 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white h-10 shrink-0">
                  <Filter className="w-4 h-4" />
                  필터
                  {activeFilterCount > 0 && <Badge className="h-5 px-1.5">{activeFilterCount}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Simplified Menu for brevity/cleanliness - typically would be nested or separate but keeping one menu for "Filter" button style */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">긴급도</DropdownMenuLabel>
                {(['긴급', '필독', '일반'] as NoticePriority[]).map(p => (
                  <DropdownMenuCheckboxItem key={p} checked={selectedPriorities.includes(p)} onCheckedChange={() => togglePriority(p)}>{p}</DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">보기 설정</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={showUnreadOnly} onCheckedChange={(c) => setShowUnreadOnly(c)}>읽지 않은 공지만 보기</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_6fr_2fr_2fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
              <div className="text-center">번호/고정</div>
              <div className="text-center">긴급도</div>
              <div className="text-center">분류</div>
              <div>제목</div>
              <div className="text-center">발신부서</div>
              <div className="text-right pr-4">등록일</div>
            </div>

            <div className="divide-y divide-border/40">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : filteredNotices.length > 0 ? (
                filteredNotices.map((notice, idx) => {
                  const priorityStyle = NOTICE_PRIORITY_STYLE[notice.priority];
                  const categoryStyle = NOTICE_CATEGORY_STYLE[notice.category];
                  const isNew = isNewNotice(notice.createdAt);

                  return (
                    <div
                      key={notice.id}
                      onClick={() => navigate(`/notices/${notice.id}`)}
                      className={`
                                        group hover:bg-muted/30 transition-colors cursor-pointer
                                        ${notice.isPinned ? 'bg-primary/5' : ''}
                                    `}
                    >
                      {/* Mobile */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notice.isPinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary/20" />}
                              <Badge className={`${priorityStyle.bgClass} ${priorityStyle.textClass} border-none rounded-[4px] px-1.5 h-5 text-[10px] font-medium`}>{notice.priority}</Badge>
                              <Badge variant="outline" className="text-muted-foreground border-border rounded-[4px] px-1.5 h-5 text-[10px] font-normal">{notice.category}</Badge>
                              {isNew && <Badge className="bg-blue-600 h-5 px-1.5 rounded-[4px] text-[10px]">NEW</Badge>}
                            </div>
                            <h3 className={`text-sm ${!notice.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                              {notice.title.replace(/^\[.*?\]\s*/, '')}
                            </h3>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{notice.sourceDepartment}</span>
                          <span>{formatSegwangDate(notice.createdAt, 'yyyy.MM.dd', mode === 'segwang')}</span>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_6fr_2fr_2fr] gap-4 p-4 items-center">
                        <div className="text-center flex justify-center">
                          {notice.isPinned ? <Pin className="w-4 h-4 text-primary fill-primary/20" /> : <span className="text-muted-foreground text-sm">{idx + 1}</span>}
                        </div>
                        <div className="text-center flex justify-center">
                          <Badge className={`${priorityStyle.bgClass} ${priorityStyle.textClass} border-none rounded-[4px] px-2 h-6 text-xs font-medium min-w-[60px] justify-center`}>{notice.priority}</Badge>
                        </div>
                        <div className="text-center flex justify-center">
                          <Badge variant="outline" className="text-muted-foreground border-border bg-white rounded-[4px] px-2 h-6 text-xs font-normal min-w-[60px] justify-center">{notice.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`truncate text-sm ${!notice.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'} group-hover:text-primary transition-colors`}>
                            {notice.title.replace(/^\[.*?\]\s*/, '')}
                          </span>
                          {isNew && <Badge className="bg-blue-600 h-5 px-1.5 rounded-[4px] text-[10px] shrink-0">NEW</Badge>}
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          {notice.sourceDepartment}
                        </div>
                        <div className="text-right pr-4 text-sm text-muted-foreground font-mono">
                          {formatSegwangDate(notice.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-muted-foreground text-sm">검색 결과가 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default NoticesPage;
