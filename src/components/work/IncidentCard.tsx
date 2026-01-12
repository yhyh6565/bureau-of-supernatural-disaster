import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, AlertTriangle, FileText, Truck, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { formatSegwangDate } from '@/utils/dateUtils';
import { useBureauStore } from '@/store/bureauStore';

interface IncidentCardProps {
    incident: Incident;
    showAction?: boolean;
    onActionClick?: (incident: Incident) => void;
    actionLabel?: string;
    department?: string;
    onManualClick?: (manualId: string) => void;
    onClick?: () => void;
}

export const IncidentCard = ({
    incident,
    showAction = false,
    onActionClick,
    actionLabel = '업무 시작',
    department,
    onManualClick,
    onClick
}: IncidentCardProps) => {
    const { mode } = useBureauStore();
    const dangerStyle = DANGER_LEVEL_STYLE[incident.dangerLevel];
    const statusStyle = STATUS_STYLE[incident.status];

    const getActionIcon = () => {
        switch (department) {
            case 'baekho': return FileText;
            case 'hyunmu': return Truck;
            case 'jujak': return CheckCircle;
            default: return ArrowRight;
        }
    };

    const ActionIcon = getActionIcon();

    return (
        <div
            className={`p-3 border border-border rounded-sm transition-colors ${onClick ? 'cursor-pointer hover:bg-accent/50' : ''}`}
            onClick={onClick}
        >
            {/* Header Row: Title & Action Area */}
            <div className="flex items-start justify-between gap-2 mb-0.5 min-h-[28px]">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
                    <h3 className="font-bold text-lg leading-tight truncate shrink-1">{incident.title}</h3>
                    {incident.title === '강남역 포식자 싱크홀' && (
                        <Badge className="bg-red-600 hover:bg-red-700 text-white border-none text-[10px] px-1.5 h-5 shrink-0">
                            긴급
                        </Badge>
                    )}
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                    {showAction && onActionClick && (
                        <Button
                            size="sm"
                            className="h-[30px] text-xs px-2 gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onActionClick(incident);
                            }}
                        >
                            <ActionIcon className="w-3.5 h-3.5" />
                            {actionLabel}
                        </Button>
                    )}

                    {incident.manualId && onManualClick && (
                        <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-accent gap-1 text-[10px] px-2 py-0.5 h-6 border-primary/50 text-primary w-full justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                onManualClick(incident.manualId!);
                            }}
                        >
                            <BookOpen className="w-3 h-3" />
                            매뉴얼
                        </Badge>
                    )}
                </div>
            </div>

            {/* Sub-Header: Case Number */}
            <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-muted-foreground">{incident.caseNumber}</span>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{incident.location}</span>
                </div>

                <p className="text-xs text-muted-foreground truncate">
                    {incident.reportContent}
                </p>

                {incident.countermeasure && (
                    <div className="mt-1.5">
                        <Badge variant="outline" className="text-[10px] text-success border-success/30 py-0 h-auto">
                            파훼법: {incident.countermeasure}
                        </Badge>
                    </div>
                )}

                {incident.entryRestrictions && (
                    <div className="mt-1.5 p-1.5 bg-destructive/10 border border-destructive/20 rounded text-[10px] text-destructive">
                        <AlertTriangle className="w-3 h-3 inline-block mr-1" />
                        진입 제한: {incident.entryRestrictions}
                    </div>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-border/50 mt-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>접수: {formatSegwangDate(incident.createdAt, 'M/d HH:mm', mode === 'segwang')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Badge className={`${dangerStyle.bgClass} ${dangerStyle.textClass} text-[10px] px-1.5 py-0 h-5 border-none`}>
                            {incident.dangerLevel}
                        </Badge>
                        <Badge className={`${statusStyle.bgClass} ${statusStyle.textClass} text-[10px] px-1.5 py-0 h-5 border-none`}>
                            {incident.status}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};
