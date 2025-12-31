import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_INCIDENTS } from '@/data/mockData';
import { Incident, DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/types/haetae';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function DangerBadge({ level }: { level: Incident['dangerLevel'] }) {
  const style = DANGER_LEVEL_STYLE[level];
  return (
    <span className={`${style.bgClass} ${style.textClass} px-2 py-0.5 text-xs font-medium rounded-full`}>
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: Incident['status'] }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={`${style.bgClass} ${style.textClass} px-2 py-0.5 text-xs font-medium rounded-sm`}>
      {status}
    </span>
  );
}

export function IncidentList() {
  // 종결되지 않은 사건만 표시
  const activeIncidents = MOCK_INCIDENTS.filter(inc => inc.status !== '종결');

  return (
    <Card className="card-gov">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          재난 현황
          <Badge variant="secondary" className="ml-auto">
            {activeIncidents.length}건 진행 중
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeIncidents.map((incident) => (
            <div 
              key={incident.id}
              className="p-3 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {incident.caseNumber}
                  </span>
                  <DangerBadge level={incident.dangerLevel} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="truncate">{incident.location}</span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {incident.reportContent}
                </p>

                {incident.darknessType && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs px-1.5 py-0.5 bg-abyssal/10 text-abyssal rounded">
                      어둠: {incident.darknessType}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Clock className="w-3 h-3" />
                  <span>접수: {format(new Date(incident.createdAt), 'M/d HH:mm', { locale: ko })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
