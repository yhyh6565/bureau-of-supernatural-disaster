import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useWorkData } from '@/hooks/useWorkData';
import { DEPARTMENT_INFO, DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { DataManager } from '@/data/dataManager';
import { ClipboardList, ArrowRight, FileSearch, Truck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '@/types/haetae';
import { useBureauStore } from '@/store/bureauStore';
import { toast } from '@/hooks/use-toast';
import { useInteractionStore } from '@/store/interactionStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export function MyAssignments() {
  const { agent } = useAuthStore();
  const { mode } = useBureauStore(); // Use global mode state
  const { processedIncidents, acceptIncident } = useWorkData();
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const { triggeredIds } = useInteractionStore();

  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];

  // 부서별 대기 업무 필터링 (내가 배정한 건 자동으로 상태가 바뀌어 제외됨)
  const getMyIncidents = () => {
    // Segwang Mode Special Handling
    if (mode === 'segwang') {
      // In Segwang mode, regardless of department, show 'Rescue Standby' from Segwang incidents
      const segwangIncidents = DataManager.getIncidents(agent, 'segwang');
      return segwangIncidents
        .filter(inc => !inc.trigger || triggeredIds.includes(inc.id)) // Only show triggered incidents
        .filter(inc => inc.status === '구조대기')
        .slice(0, 3);
    }

    switch (department) {
      case 'baekho':
        return processedIncidents.filter(inc => inc.status === '접수').slice(0, 3);
      case 'hyunmu':
        return processedIncidents.filter(inc => inc.status === '구조대기').slice(0, 3);
      case 'jujak':
        return processedIncidents.filter(inc => inc.status === '정리대기').slice(0, 3);
      default:
        return [];
    }
  };

  const myIncidents = getMyIncidents();

  const getActionLabel = () => {
    switch (department) {
      case 'baekho': return '조사 착수';
      case 'hyunmu': return '출동 수락';
      case 'jujak': return '정리 착수';
      default: return '상세 보기';
    }
  };

  const getDeptIcon = () => {
    switch (department) {
      case 'baekho': return FileSearch;
      case 'hyunmu': return Truck;
      case 'jujak': return Sparkles;
      default: return ClipboardList;
    }
  };

  const handleAcceptTask = () => {
    if (selectedIncident) {
      acceptIncident(selectedIncident.id);
    }
    toast({
      title: '업무 승낙 완료',
      description: `${selectedIncident?.title || '재난'} 건이 배정되었습니다.`,
    });
    setShowAcceptDialog(false);
    setSelectedIncident(null);
  };

  const DeptIcon = getDeptIcon();

  return (
    <>
      <Card className="card-gov">
        <CardHeader className="pt-3 md:pt-6 pb-1.5 md:pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DeptIcon className="w-4 h-4" />
              실시간 대기 업무
            </div>
            <span className={`text-xs sm:text-sm px-2 py-0.5 rounded flex items-center gap-1.5 ${deptInfo.bgClassLight} ${deptInfo.textClass}`}>
              <deptInfo.icon className="w-3.5 h-3.5" /> {deptInfo.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myIncidents.length > 0 ? (
            <div className="space-y-3">
              {myIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-3 border border-border rounded-sm hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* 상단: 상태, 등급 뱃지 */}
                      <div className="flex items-center gap-1.5">
                        <Badge className={`${STATUS_STYLE[incident.status].bgClass} ${STATUS_STYLE[incident.status].textClass} text-[10px] px-1.5 h-5`}>
                          {incident.status}
                        </Badge>
                        <Badge className={`${DANGER_LEVEL_STYLE[incident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[incident.dangerLevel].textClass} text-[10px] px-1.5 h-5`}>
                          {incident.dangerLevel}
                        </Badge>
                      </div>

                      {/* 중단: 제목 및 위치 */}
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-sm leading-tight truncate">
                          {incident.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {incident.location}
                        </p>
                      </div>
                    </div>

                    {/* 우측: 액션 버튼 */}
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs shrink-0 flex flex-col items-center justify-center gap-0.5"
                      onClick={() => { setSelectedIncident(incident); setShowAcceptDialog(true); }}
                    >
                      <span>{getActionLabel().split(' ')[0]}</span>
                      <span>{getActionLabel().split(' ')[1]}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">현재 배정된 업무가 없습니다.</p>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-2 text-xs text-muted-foreground h-8"
            onClick={() => navigate('/tasks')}
          >
            담당업무 전체 보기
          </Button>
        </CardContent>
      </Card>

      {/* 업무 승낙 다이얼로그 */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>업무 승낙 확인</DialogTitle>
            <DialogDescription>
              해당 업무를 승낙하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="py-4 space-y-3">
              <div className="p-3 bg-muted/50 rounded-sm border border-border">
                <div className="font-mono text-sm">{selectedIncident.caseNumber}</div>
                <div className="text-sm mt-1">{selectedIncident.location}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${DANGER_LEVEL_STYLE[selectedIncident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[selectedIncident.dangerLevel].textClass}`}>
                    {selectedIncident.dangerLevel}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                ※ 승낙 시 해당 업무가 본인에게 배정됩니다.
              </p>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowAcceptDialog(false)}>취소</Button>
            <Button className="flex-1 sm:flex-none" onClick={handleAcceptTask}>승낙</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
