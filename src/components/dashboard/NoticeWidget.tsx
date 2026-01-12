import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataManager } from '@/data/dataManager';
import { Bell, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function NoticeWidget() {
  const { agent } = useAuthStore();
  const navigate = useNavigate();
  const notifications = DataManager.getNotifications(agent);
  const recentNotices = notifications.slice(0, 4);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="card-gov">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
          <Bell className="w-4 h-4" />
          공지사항
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {unreadCount} 새 글
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => navigate('/notices')}
              className={`
                p-2 border rounded-sm cursor-pointer transition-colors
                ${notice.isRead
                  ? 'border-border hover:bg-accent/50'
                  : 'border-primary/30 bg-accent/30 hover:bg-accent/50'
                }
              `}
            >
              <div className="flex items-start gap-2 mb-1">
                {notice.isUrgent && (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-xs sm:text-sm truncate ${!notice.isRead ? 'font-medium' : ''}`}>
                  {notice.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(notice.createdAt), 'yyyy.MM.dd', { locale: ko })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/notices')}
          className="w-full mt-3 py-2 text-sm text-primary hover:underline"
        >
          전체 보기 →
        </button>
      </CardContent>
    </Card>
  );
}
