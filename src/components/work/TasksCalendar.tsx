import { useState, useEffect, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    AlertTriangle,
    Package,
    Shield,
    Droplets,
    FileText,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWork } from '@/contexts/WorkContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import { DataManager } from '@/data/dataManager';
import { STATUS_STYLE } from '@/constants/haetae';

// Unified Event Type
export interface CalendarEvent {
    id: string;
    date: Date;
    type: 'incident' | 'rental' | 'inspection' | 'purification' | 'approval' | 'schedule';
    title: string;
    status: string;
    dangerLevel?: string;
}

export function TasksCalendar() {
    const { agent } = useAuth();
    const { rentals } = useResource();
    const { schedules, approvals, inspectionRequests, acceptedIncidentIds } = useWork();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

    // Effect removed to enforce week view only
    /*
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('week');
            } else {
                setViewMode('month');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    */

    if (!agent) return null;

    // Data Aggregation
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        // 1. Incidents
        const allIncidents = DataManager.getIncidents(agent);
        const myIncidents = allIncidents.filter(inc => {
            if (acceptedIncidentIds.includes(inc.id)) return true;
            if (agent.department === 'baekho' && inc.status === '접수') return true;
            if (agent.department === 'hyunmu' && inc.status === '구조대기') return true;
            if (agent.department === 'jujak' && inc.status === '정리대기') return true;
            return false;
        });

        myIncidents.forEach(inc => {
            allEvents.push({
                id: `inc-${inc.id}`,
                date: new Date(inc.createdAt),
                type: 'incident',
                title: inc.title,
                status: inc.status,
                dangerLevel: inc.dangerLevel
            });
        });

        // 2. Rentals (Resources)
        rentals.forEach(rental => {
            if (rental.dueDate) {
                allEvents.push({
                    id: `rent-${rental.id}`,
                    date: new Date(rental.dueDate),
                    type: 'rental',
                    title: `${rental.equipmentName} 반납`,
                    status: rental.status
                });
            }
        });

        // 3. Inspections - REMOVED (Covered by Schedules, prevents duplication)
        /*
        inspectionRequests.forEach(insp => {
            allEvents.push({
                id: `insp-${insp.id}`,
                date: new Date(insp.scheduledDate),
                type: 'inspection',
                title: `${insp.type}`,
                status: insp.status
            });
        });
        */

        // 4. Approvals - REMOVED (User requested to hide administrative logs)
        /*
        approvals.forEach(app => {
            allEvents.push({
                id: `app-${app.id}`,
                date: new Date(app.createdAt),
                type: 'approval',
                title: app.title,
                status: app.status
            });
        });
        */

        // 5. Schedules
        schedules.forEach(sch => {
            allEvents.push({
                id: `sch-${sch.id}`,
                date: new Date(sch.date),
                type: 'schedule',
                title: sch.title,
                status: sch.type // Using type as status-like label
            });
        });

        return allEvents;
    }, [agent, rentals, schedules, approvals, inspectionRequests, acceptedIncidentIds]);

    // Calendar Logic
    const calendarDays = (() => {
        const start = viewMode === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { locale: ko });
        const end = viewMode === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { locale: ko });

        // For Month view, pad to full weeks (Sun-Sat)
        const viewStart = startOfWeek(start, { locale: ko });
        const viewEnd = endOfWeek(end, { locale: ko });

        return eachDayOfInterval({ start: viewStart, end: viewEnd });
    })();

    const next = () => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
    const prev = () => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    const renderEvents = (date: Date) => {
        const dayEvents = events.filter(e => isSameDay(e.date, date));
        return (
            <div className={`flex flex-col gap-1 mt-1 ${viewMode === 'week' ? 'gap-2' : ''}`}>
                {dayEvents.map(e => {
                    let bgClass = 'bg-secondary text-secondary-foreground';
                    let icon = null;
                    let borderClass = '';

                    if (e.type === 'incident') {
                        bgClass = STATUS_STYLE[e.status]?.bgClass || bgClass;
                        if (e.dangerLevel === '멸형') borderClass = 'border-l-2 border-destructive';
                        icon = <AlertTriangle className="w-3 h-3 text-destructive" />;
                    } else if (e.type === 'rental') {
                        bgClass = 'bg-orange-100 text-orange-800';
                        icon = <Package className="w-3 h-3" />;
                    } else if (e.type === 'schedule') {
                        // schedule.type is stored in e.status
                        const type = e.status;
                        if (['작전', '현장 조사', '긴급 출동', '사후 정리'].includes(type) || e.title.includes('출동') || e.title.includes('조사')) {
                            // 업무 (Work) -> Green
                            bgClass = 'bg-green-100 text-green-800';
                            icon = <Briefcase className="w-3 h-3" />;
                        } else if (['방문예약', '검사'].includes(type) || e.title.includes('예약')) {
                            // 예약 (Reservation) -> Blue
                            bgClass = 'bg-blue-100 text-blue-800';
                            icon = <CalendarIcon className="w-3 h-3" />;
                        } else {
                            // 행사/기타 (Events) -> Gray
                            bgClass = 'bg-gray-100 text-gray-800';
                            icon = <CalendarIcon className="w-3 h-3" />;
                        }
                    }

                    return (
                        <div
                            key={e.id}
                            className={`
                        text-xs p-2 rounded flex items-center gap-1.5 cursor-pointer hover:opacity-80
                        ${bgClass} ${borderClass}
                        ${viewMode === 'week' ? 'p-3' : ''}
                    `}
                        >
                            {icon}
                            <div className="min-w-0 flex-1 truncate font-medium">
                                {e.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="card-gov h-full min-h-[600px] flex flex-col">
            <div className="py-1 px-2 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="w-7 h-7" onClick={prev} aria-label="이전 달">
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <h2 className="text-base font-bold min-w-[80px] text-center">
                            {format(currentDate, 'yyyy. MM', { locale: ko })}
                        </h2>
                        <Button variant="outline" size="icon" className="w-7 h-7" onClick={next} aria-label="다음 달">
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={today}>
                        오늘
                    </Button>
                </div>

                {/* View Toggle Removed - Week View Only */}
                <div className="hidden">
                    <Button
                        variant={viewMode === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setViewMode('month')}
                    >
                        월간
                    </Button>
                    <Button
                        variant={viewMode === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setViewMode('week')}
                    >
                        주간
                    </Button>
                </div>
            </div>

            <CardContent className="p-0 flex-1 flex flex-col">
                {/* Header Row - Only for Month View or Desktop */}
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 border-b bg-muted/40 divide-x">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div
                                key={day}
                                className={`
                        py-2 text-center text-xs font-medium 
                        ${i === 0 ? 'text-destructive' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'}
                    `}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                )}

                {/* Calendar Grid */}

                {/* VIEW 1: MONTH (Desktop) */}
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] divide-x divide-y border-b flex-1">
                        {calendarDays.map((day) => {
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div
                                    key={day.toString()}
                                    className={`
                        p-1 relative flex flex-col gap-1
                        ${!isCurrentMonth ? 'bg-muted/10 text-muted-foreground/30' : 'bg-background'}
                        ${isToday ? 'bg-primary/5' : ''}
                    `}
                                >
                                    <div className="text-center">
                                        <span
                                            className={`
                                text-xs font-medium w-6 h-6 inline-flex items-center justify-center rounded-full
                                ${isToday ? 'bg-primary text-primary-foreground' : ''}
                            `}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    {renderEvents(day)}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* VIEW 2: WEEK (Mobile - Vertical Stack) */}
                {viewMode === 'week' && (
                    <div className="flex flex-col flex-1 divide-y">
                        {calendarDays.map((day) => {
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div key={day.toString()} className={`p-3 min-h-[80px] ${isToday ? 'bg-primary/5' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(day, 'EEE', { locale: ko })}
                                        </span>
                                        {isToday && <Badge variant="outline" className="text-[10px] h-4">Today</Badge>}
                                    </div>
                                    {renderEvents(day)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
