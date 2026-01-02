import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import { useWork } from '@/contexts/WorkContext';
import {
    format,
    isSameDay,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    addDays,
    subDays
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    AlertTriangle,
    Calendar as CalendarIcon,
    Shield,
    Package,
    FileText,
    Droplets,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {
    Incident,
    RentalRecord,
    InspectionRequest,
    ApprovalDocument
} from '@/types/haetae';

// 1. Unified Event Type
export interface CalendarEvent {
    id: string;
    date: Date;
    type: 'incident' | 'rental' | 'inspection' | 'purification' | 'approval' | 'schedule';
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    meta?: any; // Original data
}

export function TasksCalendar() {
    const { agent } = useAuth();
    const { rentals } = useResource(); // Dynamic rentals
    const { schedules, approvals, inspectionRequests } = useWork(); // Dynamic work data

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date()); // For month navigation
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Resize listener for responsive view
    useState(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    // 2. Data Aggregation
    const events = useMemo(() => {
        if (!agent) return [];
        const allEvents: CalendarEvent[] = [];

        // A. Incidents (Work) -> CreatedAt
        const incidents = DataManager.getIncidents(agent);
        incidents.forEach(inc => {
            allEvents.push({
                id: `inc-${inc.id}`,
                date: new Date(inc.createdAt),
                type: 'incident',
                title: `[${inc.dangerLevel}] ${inc.location} 재난`,
                description: inc.reportContent,
                priority: inc.dangerLevel === '멸형' || inc.dangerLevel === '파형' ? 'high' : 'medium',
                meta: inc
            });
        });

        // B. Rentals (Resources) -> DueDate
        // Use rentals from context which handles dynamic updates
        if (rentals) {
            rentals.forEach(rental => {
                if (rental.dueDate) {
                    allEvents.push({
                        id: `rent-${rental.id}`,
                        date: new Date(rental.dueDate),
                        type: 'rental',
                        title: `반납 마감: ${rental.equipmentName}`,
                        description: rental.status === '연체' ? '현재 연체 중입니다.' : undefined,
                        priority: rental.status === '연체' ? 'high' : 'medium',
                        meta: rental
                    });
                }
            });
        }

        // C. Inspections (Health) -> ScheduledDate
        // Use inspectionRequests from context
        inspectionRequests.forEach(insp => {
            allEvents.push({
                id: `insp-${insp.id}`,
                date: new Date(insp.scheduledDate),
                type: 'inspection',
                title: `${insp.type} 일정`,
                description: insp.status === '완료' ? `결과: ${insp.result}` : '검사 예정',
                priority: 'high',
                meta: insp
            });
        });

        // D. Purification History (Health) -> Visit Date
        if (agent.purificationHistory) {
            agent.purificationHistory.forEach((date, index) => {
                allEvents.push({
                    id: `puri-${index}`,
                    date: new Date(date),
                    type: 'purification',
                    title: '용천 선녀탕 방문',
                    description: '정신 오염 정화 완료',
                    priority: 'low',
                    meta: date
                });
            });
        }

        // E. Approvals (Admin) -> CreatedAt
        // Use approvals from context
        approvals.forEach(app => {
            allEvents.push({
                id: `app-${app.id}`,
                date: new Date(app.createdAt),
                type: 'approval',
                title: `결재 기안: ${app.title}`,
                description: `상태: ${app.status}`,
                priority: 'low',
                meta: app
            });
        });

        // F. Static Schedules -> Date
        // Use schedules from context
        schedules.forEach(sch => {
            allEvents.push({
                id: `sch-${sch.id}`,
                date: new Date(sch.date),
                type: 'schedule',
                title: sch.title,
                description: sch.type,
                priority: 'medium',
                meta: sch
            });
        });

        return allEvents;
    }, [agent, rentals, schedules, approvals, inspectionRequests]);

    // 3. Helper to get events for a date
    const getEventsForDate = (date: Date) => {
        return events.filter(e => isSameDay(e.date, date));
    };

    // 4. Render Day Decoration
    const renderDay = (day: Date) => {
        const dayEvents = getEventsForDate(day);
        if (dayEvents.length === 0) return <div>{format(day, 'd')}</div>;

        const hasHighPriority = dayEvents.some(e => e.priority === 'high');
        const hasWork = dayEvents.some(e => e.type === 'incident');
        const hasPersonal = dayEvents.some(e => ['rental', 'inspection', 'purification', 'approval'].includes(e.type));

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <span>{format(day, 'd')}</span>
                <div className="absolute bottom-1 flex gap-0.5">
                    {hasWork && <div className="w-1 h-1 rounded-full bg-destructive" />}
                    {hasPersonal && <div className="w-1 h-1 rounded-full bg-primary" />}
                </div>
            </div>
        );
    };

    // 5. Selected Date Display
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    // Mobile Weekly View Logic
    const weekDays = useMemo(() => {
        const start = startOfWeek(viewDate, { locale: ko });
        const end = endOfWeek(viewDate, { locale: ko });
        return eachDayOfInterval({ start, end });
    }, [viewDate]);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Section */}
            <Card className="card-gov flex-1 border-0 lg:border">
                <CardContent className="p-0 lg:p-4">
                    {/* Mobile Weekly Custom View */}
                    {isMobile ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4 pt-4">
                                <Button variant="ghost" size="icon" onClick={() => setViewDate(subDays(viewDate, 7))} aria-label="이전 주">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="font-semibold">
                                    {format(viewDate, 'yyyy년 M월', { locale: ko })} {Math.ceil(viewDate.getDate() / 7)}주차
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setViewDate(addDays(viewDate, 7))} aria-label="다음 주">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 px-2 text-center">
                                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                    <div key={d} className="text-xs text-muted-foreground py-2">{d}</div>
                                ))}
                                {weekDays.map(day => {
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const dayEvents = getEventsForDate(day);
                                    const hasHigh = dayEvents.some(e => e.priority === 'high');
                                    const hasEvent = dayEvents.length > 0;

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                        flex flex-col items-center justify-center py-3 rounded-lg text-sm relative
                                        ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                                        ${!isSameMonth(day, viewDate) ? 'opacity-30' : ''}
                                    `}
                                        >
                                            <span className="mb-1">{format(day, 'd')}</span>
                                            {hasEvent && (
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : (hasHigh ? 'bg-destructive' : 'bg-primary')}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Desktop Monthly View */
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={ko}
                            className="w-full"
                            components={{
                                DayContent: ({ date }) => renderDay(date)
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Detail List Section */}
            <Card className="card-gov flex-1 h-full min-h-[400px]">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {selectedDate ? format(selectedDate, 'M월 d일 일정', { locale: ko }) : '날짜를 선택하세요'}
                        <Badge variant="secondary" className="ml-auto">
                            {selectedEvents.length}건
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedEvents.length > 0 ? (
                        <div className="space-y-3">
                            {selectedEvents.map(event => (
                                <div key={event.id} className="flex gap-3 p-3 border rounded-sm hover:bg-accent/50 transition-colors">
                                    {/* Icon based on Type */}
                                    <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                ${event.type === 'incident' ? 'bg-destructive/10 text-destructive' :
                                            event.type === 'rental' ? 'bg-warning/10 text-warning' :
                                                event.type === 'purification' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-primary/10 text-primary'}
                            `}>
                                        {event.type === 'incident' && <AlertTriangle className="w-4 h-4" />}
                                        {event.type === 'rental' && <Package className="w-4 h-4" />}
                                        {event.type === 'inspection' && <Shield className="w-4 h-4" />}
                                        {event.type === 'purification' && <Droplets className="w-4 h-4" />}
                                        {(event.type === 'approval' || event.type === 'schedule') && <FileText className="w-4 h-4" />}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{event.title}</span>
                                            {event.priority === 'high' && (
                                                <Badge variant="destructive" className="text-[10px] h-4 px-1">중요</Badge>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                            {format(event.date, 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                            <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                            일정이 없습니다.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
