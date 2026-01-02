import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useWork } from '@/contexts/WorkContext';
import { Incident } from '@/types/haetae';
import { DEPARTMENT_INFO, DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { DataManager } from '@/data/dataManager';
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
import { Shield, Ban, List, Calendar as CalendarIcon } from 'lucide-react';
import { TasksCalendar } from '@/components/work/TasksCalendar';
import { IncidentCard } from '@/components/work/IncidentCard';

import { ManualViewer } from '@/components/work/ManualViewer';

import { useSearchParams } from 'react-router-dom';

export function TasksPage() {
  const { agent } = useAuth();
  const { acceptedIncidentIds, acceptIncident } = useWork(); // Use Context
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  // const [acceptedIncidentIds, setAcceptedIncidentIds] = useState<string[]>([]); // Removed local state

  // Manual View State
  const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
  const [showManualDialog, setShowManualDialog] = useState(false);

  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];
  const incidents = DataManager.getIncidents(agent);

  // 부서별 업무 필터링
  const getTasksByDepartment = () => {
    switch (department) {
      case 'baekho':
        return {
          list: incidents.filter(inc => inc.status === '접수' && !acceptedIncidentIds.includes(inc.id)),
          assigned: [...incidents.filter(inc => inc.status === '조사중'), ...incidents.filter(inc => acceptedIncidentIds.includes(inc.id) && inc.status === '접수')],
          listLabel: '접수된 조사 요청',
          assignedLabel: '나의 조사 업무',
        };
      case 'hyunmu':
        return {
          list: incidents.filter(inc => inc.status === '구조대기' && !acceptedIncidentIds.includes(inc.id)),
          assigned: [...incidents.filter(inc => inc.status === '구조중'), ...incidents.filter(inc => acceptedIncidentIds.includes(inc.id) && inc.status === '구조대기')],
          listLabel: '구조 요청 목록',
          assignedLabel: '나의 구조 업무',
        };
      case 'jujak':
        return {
          list: incidents.filter(inc => inc.status === '정리대기' && !acceptedIncidentIds.includes(inc.id)),
          assigned: [...incidents.filter(inc => inc.status === '정리중'), ...incidents.filter(inc => acceptedIncidentIds.includes(inc.id) && inc.status === '정리대기')],
          listLabel: '정리 요청 목록',
          assignedLabel: '나의 정리 업무',
        };
      default:
        return { list: [], assigned: [], listLabel: '', assignedLabel: '' };
    }
  };

  const tasks = getTasksByDepartment();

  const handleAcceptTask = () => {
    if (selectedIncident) {
      acceptIncident(selectedIncident.id); // Use Context method
    }
    toast({
      title: '업무 승낙 완료',
      description: `${selectedIncident?.title || '재난'} 건이 배정되었습니다.`,
    });
    setShowAcceptDialog(false);
    setSelectedIncident(null);
  };

  const handleManualClick = (manualId: string) => {
    setSelectedManualId(manualId);
    setShowManualDialog(true);
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

  return (
    <MainLayout>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            목록 보기
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            캘린더 보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
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
                      onActionClick={(inc) => {
                        setSelectedIncident(inc);
                        setShowAcceptDialog(true);
                      }}
                      actionLabel={action.label}
                      department={department}
                      onManualClick={handleManualClick}
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
                      <IncidentCard
                        incident={incident}
                        onManualClick={handleManualClick}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowDetailDialog(true);
                          }}
                        >
                          상세 보기
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            toast({
                              title: '보고서 작성 페이지로 이동',
                              description: '결재 페이지에서 보고서를 작성할 수 있습니다.',
                            });
                            window.location.href = '/approvals';
                          }}
                        >
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
        </TabsContent>

        <TabsContent value="calendar">
          <TasksCalendar />
        </TabsContent>
      </Tabs>

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

      {/* 재난 상세 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
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

              {/* 파훼법 (어둠 정보 대신 독립 표시) */}
              {selectedIncident.countermeasure && (
                <div className="p-3 border border-success/30 rounded-sm">
                  <div className="flex items-center gap-1 text-sm font-medium text-success mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    파훼법
                  </div>
                  <p className="text-sm">{selectedIncident.countermeasure}</p>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 매뉴얼 뷰어 */}
      <ManualViewer
        manualId={selectedManualId}
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />
    </MainLayout>
  );
}

export default TasksPage;
