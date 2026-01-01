import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, AlertTriangle, FileText, Truck, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface IncidentCardProps {
    incident: Incident;
    showAction?: boolean;
    onActionClick?: (incident: Incident) => void;
    actionLabel?: string;
    department?: string;
    onManualClick?: (manualId: string) => void;
}

export const IncidentCard = ({
    incident,
    showAction = false,
    onActionClick,
    actionLabel = '업무 시작',
    department,
    onManualClick
}: IncidentCardProps) => {
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
        <div className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{incident.caseNumber}</span>
                        <Badge className={`${dangerStyle.bgClass} ${dangerStyle.textClass} text-xs px-1.5 py-0`}>
                            {incident.dangerLevel}
                        </Badge>
                        <Badge className={`${statusStyle.bgClass} ${statusStyle.textClass} text-xs px-1.5 py-0`}>
                            {incident.status}
                        </Badge>
                        {incident.manualId && (
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-accent gap-1 text-xs px-1.5 py-0 border-primary/50 text-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onManualClick?.(incident.manualId!);
                                }}
                            >
                                <BookOpen className="w-3 h-3" />
                                매뉴얼
                            </Badge>
                        )}
                    </div>
                    {incident.title && (
                        <h3 className="font-bold text-base leading-tight">{incident.title}</h3>
                    )}
                </div>
                {showAction && onActionClick && (
                    <Button
                        size="sm"
                        className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={(e) => {
                            e.stopPropagation();
                            onActionClick(incident);
                        }}
                    >
                        <ActionIcon className="w-3.5 h-3.5" />
                        {actionLabel}
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{incident.location}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {incident.reportContent}
                </p>

                {incident.countermeasure && (
                    <div className="mt-2">
                        <Badge variant="outline" className="text-success border-success/30">
                            파훼법: {incident.countermeasure}
                        </Badge>
                    </div>
                )}

                {incident.entryRestrictions && (
                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                        <AlertTriangle className="w-3 h-3 inline-block mr-1" />
                        진입 제한: {incident.entryRestrictions}
                    </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                    <Clock className="w-3 h-3" />
                    <span>접수: {format(new Date(incident.createdAt), 'M/d HH:mm', { locale: ko })}</span>
                </div>
            </div>
        </div>
    );
};
