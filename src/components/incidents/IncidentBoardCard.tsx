import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { MapPin, Clock, BookOpen } from 'lucide-react';
import { formatSegwangDate } from '@/utils/dateUtils';
import { useBureauStore } from '@/store/bureauStore';

interface IncidentBoardCardProps {
    incident: Incident;
    onClick?: () => void;
    onManualClick?: (manualId: string) => void;
    isHighlighted?: boolean;
}

export function IncidentBoardCard({ incident, onClick, onManualClick, isHighlighted }: IncidentBoardCardProps) {
    const { mode } = useBureauStore();
    const dangerStyle = DANGER_LEVEL_STYLE[incident.dangerLevel] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' };

    return (
        <div
            className={`
                bg-card border border-border rounded-sm p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer
                ${isHighlighted ? 'animate-in fade-in slide-in-from-bottom-2 duration-700 ring-2 ring-destructive bg-destructive/5' : ''}
            `}
            onClick={onClick}
        >
            {/* 상단: 등급 + 제목 */}
            <div className="flex items-start gap-2 mb-2">
                <span className={`${dangerStyle.bgClass} ${dangerStyle.textClass} px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0`}>
                    {incident.dangerLevel}
                </span>
                <span className="text-sm font-medium truncate leading-tight">
                    {incident.title}
                </span>
            </div>

            {/* 사건 번호 */}
            <div className="text-[11px] text-muted-foreground font-mono mb-2">
                {incident.caseNumber}
            </div>

            {/* 위치 */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{incident.location}</span>
            </div>

            {/* 하단: 매뉴얼 여부 + 날짜 */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                {incident.manualId && onManualClick ? (
                    <button
                        className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onManualClick(incident.manualId!);
                        }}
                    >
                        <BookOpen className="w-3 h-3" />
                        <span>매뉴얼</span>
                    </button>
                ) : (
                    <div />
                )}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatSegwangDate(incident.createdAt, 'M/d', mode === 'segwang')}</span>
                </div>
            </div>
        </div>
    );
}
