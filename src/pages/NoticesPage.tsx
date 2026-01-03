import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import {
  Notification,
  NoticePriority,
  NoticeCategory,
  NoticeDepartment,
} from '@/types/haetae';
import { NOTICE_PRIORITY_STYLE, NOTICE_CATEGORY_STYLE } from '@/constants/haetae';
import { Bell, Search, Pin, ChevronDown } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NoticesPage() {
  const { agent } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<NoticePriority[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<NoticeCategory[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<NoticeDepartment[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // 공지사항 데이터
  const allNotices = DataManager.getNotifications(agent);

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

      return matchesSearch && matchesPriority && matchesCategory && matchesDepartment && matchesUnread;
    })
    .sort((a, b) => {
      // 상단 고정 우선
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 날짜 역순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  const isNewNotice = (createdAt: Date) => {
    return differenceInDays(new Date(), new Date(createdAt)) <= 3;
  };

  const activeFilterCount =
    selectedPriorities.length +
    selectedCategories.length +
    selectedDepartments.length +
    (showUnreadOnly ? 1 : 0);

  return (
    <MainLayout>


      {/* 검색 및 필터 */}
      <Card className="card-gov mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 검색 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="제목 또는 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-sm"
              />
            </div>

            {/* 필터 버튼들 */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {/* 긴급도 필터 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-sm">
                    긴급도
                    {selectedPriorities.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedPriorities.length}
                      </Badge>
                    )}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>긴급도</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(['긴급', '필독', '일반'] as NoticePriority[]).map(priority => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={selectedPriorities.includes(priority)}
                      onCheckedChange={() => togglePriority(priority)}
                    >
                      {priority}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 분류 필터 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-sm">
                    분류
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedCategories.length}
                      </Badge>
                    )}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>내용 분류</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(['인사', '보안', '복지', '안전', '교육', '행사', '시스템', '장비', '규정', '공지'] as NoticeCategory[]).map(category => {
                    const CategoryIcon = NOTICE_CATEGORY_STYLE[category].icon;
                    return (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      >
                        <CategoryIcon className="w-3 h-3 mr-2 inline-block" />
                        {category}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 발신부서 필터 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-sm">
                    발신부서
                    {selectedDepartments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedDepartments.length}
                      </Badge>
                    )}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>발신 부서</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(['본부', '백호반', '현무반', '주작반', '인사팀', '보안팀', '총무팀', '전산팀', '법무팀'] as NoticeDepartment[]).map(dept => (
                    <DropdownMenuCheckboxItem
                      key={dept}
                      checked={selectedDepartments.includes(dept)}
                      onCheckedChange={() => toggleDepartment(dept)}
                    >
                      {dept}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 읽지 않음만 보기 */}
              <Button
                variant={showUnreadOnly ? 'default' : 'outline'}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="rounded-sm"
              >
                읽지 않음
              </Button>
            </div>
          </div>

          {/* 활성 필터 표시 */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                활성 필터: {activeFilterCount}개
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPriorities([]);
                  setSelectedCategories([]);
                  setSelectedDepartments([]);
                  setShowUnreadOnly(false);
                }}
                className="h-6 text-xs"
              >
                전체 해제
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 공지사항 목록 */}
      <Card className="card-gov pb-12">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            공지 목록
            <Badge variant="secondary" className="ml-auto">
              {filteredNotices.length}건
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-sm overflow-hidden">
            {/* 테이블 헤더 - Desktop only */}
            <div className="hidden md:grid table-header-gov grid-cols-12 gap-2 p-3 text-xs">
              <div className="col-span-1 text-center">번호</div>
              <div className="col-span-1 text-center">긴급도</div>
              <div className="col-span-1 text-center">분류</div>
              <div className="col-span-5">제목</div>
              <div className="col-span-2 text-center">발신부서</div>
              <div className="col-span-2 text-center">등록일</div>
            </div>

            {/* 테이블 내용 */}
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice, idx) => {
                const priorityStyle = NOTICE_PRIORITY_STYLE[notice.priority];
                const categoryStyle = NOTICE_CATEGORY_STYLE[notice.category];
                const isNew = isNewNotice(notice.createdAt);

                return (
                  <div
                    key={notice.id}
                    onClick={() => navigate(`/notices/${notice.id}`)}
                    className={`
                      border-t border-border cursor-pointer transition-colors
                      ${notice.isPinned ? 'bg-accent/50' : ''}
                      ${!notice.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'}
                    `}
                  >
                    {/* Mobile Card Layout */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {notice.isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                            <Badge className={`${priorityStyle.bgClass} ${priorityStyle.textClass} text-xs`}>
                              {notice.priority}
                            </Badge>
                            <Badge className={`${categoryStyle.bgClass} ${categoryStyle.textClass} text-xs`}>
                              {notice.category}
                            </Badge>
                            {isNew && <Badge className="bg-success text-xs">NEW</Badge>}
                          </div>
                          <h3 className={`text-sm ${!notice.isRead ? 'font-medium' : ''}`}>
                            {notice.title}
                          </h3>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>발신: {notice.sourceDepartment}</div>
                        <div>{format(new Date(notice.createdAt), 'yyyy.MM.dd', { locale: ko })}</div>
                      </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-2 p-3 text-sm">
                      <div className="col-span-1 text-center flex items-center justify-center">
                        {notice.isPinned ? (
                          <Pin className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <span className="text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                      <div className="col-span-1 text-center flex items-center justify-center">
                        <Badge className={`${categoryStyle.bgClass} ${categoryStyle.textClass} text-xs md:w-full md:justify-center`}>
                          {notice.category}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-center flex items-center justify-center">
                        <Badge className={`${priorityStyle.bgClass} ${priorityStyle.textClass} text-xs md:w-full md:justify-center`}>
                          {notice.priority}
                        </Badge>
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <span className={`truncate ${!notice.isRead ? 'font-medium' : ''}`}>
                          {notice.title}
                        </span>
                        {isNew && (
                          <Badge className="bg-success text-xs h-4 px-1.5">NEW</Badge>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-muted-foreground flex items-center justify-center">
                        {notice.sourceDepartment}
                      </div>
                      <div className="col-span-2 text-center text-muted-foreground flex items-center justify-center">
                        {format(new Date(notice.createdAt), 'yyyy.MM.dd', { locale: ko })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default NoticesPage;
