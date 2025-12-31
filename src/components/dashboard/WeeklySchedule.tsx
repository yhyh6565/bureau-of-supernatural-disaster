import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_SCHEDULES } from '@/data/mockData';
import { Calendar, Clock, MapPin, FileCheck, UserCheck, Dumbbell } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

const SCHEDULE_ICONS: Record<string, React.ElementType> = {
  '작전': MapPin,
  '방문예약': Calendar,
  '결재마감': FileCheck,
  '당직': UserCheck,
  '훈련': Dumbbell,
};

const SCHEDULE_COLORS: Record<string, string> = {
  '작전': 'text-destructive',
  '방문예약': 'text-primary',
  '결재마감': 'text-warning',
  '당직': 'text-muted-foreground',
  '훈련': 'text-success',
};

export function WeeklySchedule() {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));

  const getSchedulesForDate = (date: Date) => {
    return MOCK_SCHEDULES.filter(s => isSameDay(new Date(s.date), date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return '오늘';
    if (isTomorrow(date)) return '내일';
    return format(date, 'E', { locale: ko });
  };

  return (
    <Card className="card-gov">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          주 단위 일정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {weekDays.map((date, idx) => {
            const schedules = getSchedulesForDate(date);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={idx}
                className={`
                  flex gap-3 p-2 rounded-sm border
                  ${isCurrentDay 
                    ? 'bg-accent border-primary/30' 
                    : 'bg-card border-border'
                  }
                `}
              >
                {/* 날짜 */}
                <div className="w-16 flex-shrink-0 text-center">
                  <div className={`text-xs ${isCurrentDay ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {formatDateLabel(date)}
                  </div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                    {format(date, 'd')}
                  </div>
                </div>

                {/* 일정 목록 */}
                <div className="flex-1 min-w-0">
                  {schedules.length > 0 ? (
                    <div className="space-y-1">
                      {schedules.map((schedule) => {
                        const Icon = SCHEDULE_ICONS[schedule.type] || Calendar;
                        const colorClass = SCHEDULE_COLORS[schedule.type] || 'text-foreground';

                        return (
                          <div 
                            key={schedule.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
                            <span className="font-mono text-xs text-muted-foreground">
                              {format(new Date(schedule.date), 'HH:mm')}
                            </span>
                            <span className="truncate">{schedule.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">일정 없음</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
