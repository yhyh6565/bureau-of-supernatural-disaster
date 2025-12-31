import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO, DANGER_LEVEL_STYLE, STATUS_STYLE, Incident } from '@/types/haetae';
import { MOCK_INCIDENTS } from '@/data/mockData';
import { Briefcase, MapPin, AlertTriangle, Clock, CheckCircle, ArrowRight, FileText, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export function TasksPage() {
  const { agent } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);

  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];

  // 부서별 업무 필터링
  const getTasksByDepartment = () => {
    switch (department) {
      case 'baekho':
        return {
          list: MOCK_INCIDENTS.filter(inc => inc.status === '접수'),
          assigned: MOCK_INCIDENTS.filter(inc => inc.status === '조사중'),
          listLabel: '접수된 조사 요청',
          assignedLabel: '나의 조사 업무',
        };
      case 'hyunmu':
        return {
          list: MOCK_INCIDENTS.filter(inc => inc.status === '구조대기'),
          assigned: MOCK_INCIDENTS.filter(inc => inc.status === '구조중'),
          listLabel: '구조 요청 목록',
          assignedLabel: '나의 구조 업무',
        };
      case 'jujak':
        return {
          list: MOCK_INCIDENTS.filter(inc => inc.status === '정리대기'),
          assigned: MOCK_INCIDENTS.filter(inc => inc.status === '정리중'),
          listLabel: '정리 요청 목록',
          assignedLabel: '나의 정리 업무',
        };
      default:
        return { list: [], assigned: [], listLabel: '', assignedLabel: '' };
    }
  };

  const tasks = getTasksByDepartment();

  const handleAcceptTask = () => {
    toast({
      title: '업무 승낙 완료',
      description: `${selectedIncident?.caseNumber} 건이 배정되었습니다.`,
    });
    setShowAcceptDialog(false);
    setSelectedIncident(null);
  };

  const getActionButton = () => {
    switch (department) {
      case 'baekho':
        return { label: '조사 시작', icon: FileText };
      case 'hyunmu':
        return { label: '출동 승낙', icon: Truck };
      case 'jujak':
        return { label: '정리 시작', icon: CheckCircle };
      default:
        return { label: '업무 시작', icon: ArrowRight };
    }
  };

  const action = getActionButton();

  const IncidentCard = ({ incident, showAction = false }: { incident: Incident; showAction?: boolean }) => {
    const dangerStyle = DANGER_LEVEL_STYLE[incident.dangerLevel];
    const statusStyle = STATUS_STYLE[incident.status];

    return (
      <div className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{incident.caseNumber}</span>
            <Badge className={`${dangerStyle.bgClass} ${dangerStyle.textClass}`}>
              {incident.dangerLevel}
            </Badge>
            <Badge className={`${statusStyle.bgClass} ${statusStyle.textClass}`}>
              {incident.status}
            </Badge>
          </div>
          {showAction && (
            <Button 
              size="sm" 
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIncident(incident);
                setShowAcceptDialog(true);
              }}
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
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

          {incident.darknessType && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-abyssal border-abyssal/30">
                어둠: {incident.darknessType}
              </Badge>
              {incident.countermeasure && (
                <Badge variant="outline" className="text-success border-success/30">
                  파훼법: {incident.countermeasure}
                </Badge>
              )}
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

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold">담당업무</h1>
          <Badge className={`bg-${deptInfo.colorClass}/10 text-${deptInfo.colorClass}`}>
            {deptInfo.icon} {deptInfo.name} ({deptInfo.fullName})
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {department === 'baekho' && '접수된 초자연 재난을 조사하고 보고서를 작성합니다.'}
          {department === 'hyunmu' && '구조 요청에 출동하고 구조 활동을 수행합니다.'}
          {department === 'jujak' && '현장 정리 및 사후 처리, 은폐 업무를 수행합니다.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-12">
        {/* 업무 목록 */}
        <Card className="card-gov">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {tasks.listLabel}
              <Badge variant="secondary" className="ml-auto">{tasks.list.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.list.length > 0 ? (
              tasks.list.map((incident) => (
                <IncidentCard 
                  key={incident.id} 
                  incident={incident} 
                  showAction={department === 'hyunmu'} // 현무팀은 자율 배정
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>대기 중인 업무가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 나의 배정 업무 */}
        <Card className="card-gov">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              {tasks.assignedLabel}
              <Badge variant="secondary" className="ml-auto">{tasks.assigned.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.assigned.length > 0 ? (
              tasks.assigned.map((incident) => (
                <div key={incident.id}>
                  <IncidentCard incident={incident} />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      상세 보기
                    </Button>
                    <Button size="sm" className="flex-1">
                      보고서 작성
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>배정된 업무가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 업무 승낙 다이얼로그 (현무팀) */}
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
                  <Badge className={DANGER_LEVEL_STYLE[selectedIncident.dangerLevel].bgClass}>
                    {selectedIncident.dangerLevel}
                  </Badge>
                  {selectedIncident.darknessType && (
                    <Badge variant="outline" className="text-abyssal">
                      {selectedIncident.darknessType}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                ※ 승낙 시 해당 업무가 본인에게 배정됩니다.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>취소</Button>
            <Button onClick={handleAcceptTask}>승낙</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default TasksPage;
