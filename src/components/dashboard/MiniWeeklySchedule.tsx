import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataManager } from '@/data/dataManager';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format, isToday, isTomorrow, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export function MiniWeeklySchedule() {
    const { agent } = useAuth();
    const schedules = DataManager.getSchedules(agent);
    const today = new Date();

    // Get upcoming schedules (Today + Next 2 days) - Simplified for sidebar
    const upcomingSchedules = schedules.filter(s => {
        const sDate = new Date(s.date);
        return sDate >= new Date(today.setHours(0, 0, 0, 0));
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3); // Take top 3

    const getRelativeLabel = (date: Date) => {
        if (isToday(date)) return '오늘';
        if (isTomorrow(date)) return '내일';
        return format(date, 'M.d (E)', { locale: ko });
    };

    return (
        <Card className="card-gov h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    주요 일정
                </CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingSchedules.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingSchedules.map(schedule => (
                            <div key={schedule.id} className="flex gap-3 items-start text-sm">
                                <div className="flex flex-col items-center min-w-[3rem] bg-accent/50 rounded p-1">
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {getRelativeLabel(new Date(schedule.date))}
                                    </span>
                                    <span className="font-mono font-bold">
                                        {format(new Date(schedule.date), 'HH:mm')}
                                    </span>
                                </div>
                                <div className="py-1">
                                    <p className="font-medium line-clamp-1">{schedule.title}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        <span>{schedule.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                        예정된 일정이 없습니다.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
