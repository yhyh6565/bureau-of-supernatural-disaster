import { Incident } from '@/types/haetae';
import { IncidentBoardCard } from './IncidentBoardCard';
import { Badge } from '@/components/ui/badge';

interface IncidentColumnProps {
    title: string;
    incidents: Incident[];
    colorClass?: string;
    onCardClick?: (incident: Incident) => void;
    onManualClick?: (manualId: string) => void;
}

export function IncidentColumn({ title, incidents, colorClass = 'bg-muted', onCardClick, onManualClick }: IncidentColumnProps) {
    return (
        <div className="flex-shrink-0 w-72 bg-muted/30 rounded-md border border-border flex flex-col max-h-[calc(100vh-200px)]">
            {/* 컬럼 헤더 */}
            <div className={`p-3 border-b border-border flex items-center justify-between ${colorClass}`}>
                <span className="font-medium text-sm">{title}</span>
                <Badge variant="secondary" className="text-xs">
                    {incidents.length}
                </Badge>
            </div>

            {/* 카드 목록 */}
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {incidents.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        해당 재난 없음
                    </div>
                ) : (
                    incidents.map((incident) => (
                        <IncidentBoardCard key={incident.id} incident={incident} onClick={() => onCardClick?.(incident)} onManualClick={onManualClick} />
                    ))
                )}
            </div>
        </div>
    );
}
