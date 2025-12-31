import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';
import { Bell, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<typeof MOCK_NOTIFICATIONS[0] | null>(null);

  const filteredNotices = MOCK_NOTIFICATIONS.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold">공지사항</h1>
        <p className="text-sm text-muted-foreground">전체 공지 및 부서별 필독 지침을 확인합니다.</p>
      </div>

      <Card className="card-gov mb-4">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-sm"
              />
            </div>
            <Button variant="outline" className="rounded-sm">
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gov pb-12">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            공지 목록
            <Badge variant="secondary" className="ml-auto">{filteredNotices.length}건</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-sm overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="table-header-gov grid grid-cols-12 gap-2 p-3">
              <div className="col-span-1 text-center">구분</div>
              <div className="col-span-7">제목</div>
              <div className="col-span-2 text-center">작성일</div>
              <div className="col-span-2 text-center">상태</div>
            </div>

            {/* 테이블 내용 */}
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className={`
                    grid grid-cols-12 gap-2 p-3 border-t border-border cursor-pointer transition-colors
                    ${!notice.isRead ? 'bg-accent/30' : 'hover:bg-accent/50'}
                  `}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <div className="col-span-1 text-center">
                    {notice.isUrgent ? (
                      <AlertTriangle className="w-4 h-4 text-destructive mx-auto" />
                    ) : (
                      <span className="text-muted-foreground text-sm">{idx + 1}</span>
                    )}
                  </div>
                  <div className="col-span-7 flex items-center gap-2">
                    {notice.isUrgent && (
                      <Badge variant="destructive" className="text-xs">긴급</Badge>
                    )}
                    <span className={`truncate ${!notice.isRead ? 'font-medium' : ''}`}>
                      {notice.title}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-muted-foreground">
                    {format(new Date(notice.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </div>
                  <div className="col-span-2 text-center">
                    {notice.isRead ? (
                      <span className="text-xs text-muted-foreground">읽음</span>
                    ) : (
                      <Badge className="bg-primary text-xs">NEW</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 공지 상세 모달 */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotice?.isUrgent && (
                <Badge variant="destructive">긴급</Badge>
              )}
              {selectedNotice?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-3">
              <span>작성일: {selectedNotice && format(new Date(selectedNotice.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}</span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedNotice?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default NoticesPage;
