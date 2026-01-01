import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { NOTICE_PRIORITY_STYLE, NOTICE_CATEGORY_STYLE } from '@/types/haetae';
import { ArrowLeft, Calendar, Building2, User, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agent } = useAuth();

  const notifications = DataManager.getNotifications(agent);
  const notice = notifications.find(n => n.id === id);

  if (!notice) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg text-muted-foreground mb-4">공지사항을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/notices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  const priorityStyle = NOTICE_PRIORITY_STYLE[notice.priority];
  const categoryStyle = NOTICE_CATEGORY_STYLE[notice.category];

  return (
    <MainLayout>
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/notices')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>
      </div>

      {/* 공지사항 본문 */}
      <Card className="card-gov max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* 상단 고정 표시 */}
          {notice.isPinned && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Pin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">상단 고정 공지</span>
            </div>
          )}

          {/* 제목 */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${priorityStyle.bgClass} ${priorityStyle.textClass}`}>
                {notice.priority}
              </Badge>
              <Badge className={`${categoryStyle.bgClass} ${categoryStyle.textClass}`}>
                {categoryStyle.icon} {notice.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold leading-tight">
              {notice.title}
            </h1>
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 mb-6 border-y bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">발신 부서</div>
                <div className="font-medium">{notice.sourceDepartment}</div>
              </div>
            </div>

            {notice.author && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">작성자</div>
                  <div className="font-medium">{notice.author}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">등록일</div>
                <div className="font-medium">
                  {format(new Date(notice.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                </div>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="prose prose-sm max-w-none">
            <div className="text-base leading-relaxed whitespace-pre-wrap">
              {notice.fullContent}
            </div>
          </div>

          {/* 하단 서명 */}
          <div className="mt-8 pt-6 border-t text-right">
            <div className="text-sm text-muted-foreground">
              {notice.sourceDepartment}
            </div>
            {notice.author && (
              <div className="text-sm text-muted-foreground">
                {notice.author}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate('/notices')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>

            {!notice.isRead && (
              <span className="text-xs text-muted-foreground">
                ※ 확인 시 자동으로 읽음 처리됩니다
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 정부 기관 하단 공지 */}
      <div className="max-w-4xl mx-auto mt-6 p-4 text-center text-xs text-muted-foreground border-t">
        <p>본 공지사항은 환경부 초자연재난관리국 내부 공지로서, 무단 전재 및 재배포를 금지합니다.</p>
        <p className="mt-1">문의사항이 있으신 경우 발신 부서로 연락 바랍니다.</p>
      </div>
    </MainLayout>
  );
}

export default NoticeDetailPage;
