import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/data/dataManager';
import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { AlertTriangle, MapPin, Clock, Shield, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const { agent } = useAuth();
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const incidents = DataManager.getIncidents(agent);
  // 종결되지 않은 사건만 표시
  const activeIncidents = incidents.filter(inc => inc.status !== '종결');

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
              onClick={() => setSelectedIncident(incident)}
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

      {/* 재난 상세 모달 */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              재난 상세 정보
              {selectedIncident && (
                <>
                  <Badge className={`${DANGER_LEVEL_STYLE[selectedIncident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[selectedIncident.dangerLevel].textClass}`}>
                    {selectedIncident.dangerLevel}
                  </Badge>
                  <Badge className={`${STATUS_STYLE[selectedIncident.status].bgClass} ${STATUS_STYLE[selectedIncident.status].textClass}`}>
                    {selectedIncident.status}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground w-24">사건 번호</span>
                  <span className="font-mono">{selectedIncident.caseNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground w-24">등록 번호</span>
                  <span className="font-mono text-xs">{selectedIncident.registrationNumber}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-muted-foreground">발생 위치</span>
                    <p className="mt-1">{selectedIncident.location}</p>
                  </div>
                </div>
              </div>

              {/* 제보 내용 */}
              <div className="p-3 bg-muted/50 rounded-sm border">
                <div className="font-medium text-sm mb-2">제보 내용</div>
                <p className="text-sm text-muted-foreground">{selectedIncident.reportContent}</p>
              </div>

              {/* 어둠 정보 */}
              {selectedIncident.darknessType && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-abyssal/30 rounded-sm">
                    <div className="flex items-center gap-1 text-sm font-medium text-abyssal mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      어둠 종류
                    </div>
                    <p className="text-sm">{selectedIncident.darknessType}</p>
                  </div>
                  {selectedIncident.countermeasure && (
                    <div className="p-3 border border-success/30 rounded-sm">
                      <div className="flex items-center gap-1 text-sm font-medium text-success mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        파훼법
                      </div>
                      <p className="text-sm">{selectedIncident.countermeasure}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 진입 제한 */}
              {selectedIncident.entryRestrictions && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <div className="flex items-center gap-1 text-sm font-medium text-destructive mb-1">
                    <Ban className="w-3.5 h-3.5" />
                    진입 제한
                  </div>
                  <p className="text-sm text-destructive">{selectedIncident.entryRestrictions}</p>
                </div>
              )}

              {/* 시간 정보 */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>접수: {format(new Date(selectedIncident.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>업데이트: {format(new Date(selectedIncident.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedIncident(null);
                navigate('/equipment');
              }}
              className="w-full sm:w-auto"
            >
              장비 신청
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={() => setSelectedIncident(null)}
                className="flex-1"
              >
                닫기
              </Button>
              <Button
                onClick={() => {
                  setSelectedIncident(null);
                  navigate('/tasks');
                }}
                className="flex-1"
              >
                담당업무로 이동
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
