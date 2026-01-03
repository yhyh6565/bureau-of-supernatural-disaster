import { Incident, DangerLevel, IncidentStatus } from '@/types/haetae';
import { IncidentColumn } from './IncidentColumn';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';

type GroupBy = 'status' | 'dangerLevel';

interface IncidentBoardProps {
    incidents: Incident[];
    groupBy: GroupBy;
    onCardClick?: (incident: Incident) => void;
    onManualClick?: (manualId: string) => void;
    highlightId?: string | null;
}

const STATUS_ORDER: IncidentStatus[] = ['접수', '조사중', '구조대기', '구조중', '정리대기', '정리중', '종결', '봉인'];
const DANGER_ORDER: DangerLevel[] = ['멸형', '파형', '뇌형', '고형'];

export function IncidentBoard({ incidents, groupBy, onCardClick, onManualClick, highlightId }: IncidentBoardProps) {
    const columns = groupBy === 'status'
        ? STATUS_ORDER.map(status => ({
            key: status,
            title: status,
            items: incidents.filter(inc => inc.status === status),
            colorClass: STATUS_STYLE[status]?.bgClass ?? 'bg-muted',
        }))
        : DANGER_ORDER.map(level => ({
            key: level,
            title: level,
            items: incidents.filter(inc => inc.dangerLevel === level),
            colorClass: DANGER_LEVEL_STYLE[level]?.bgClass ?? 'bg-muted',
        }));

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <IncidentColumn
                    key={col.key}
                    title={col.title}
                    incidents={col.items}
                    colorClass={col.colorClass}
                    onCardClick={onCardClick}
                    onManualClick={onManualClick}
                    highlightId={highlightId}
                />
            ))}
        </div>
    );
}
