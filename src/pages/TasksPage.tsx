import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useInteraction } from '@/contexts/InteractionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useWork } from '@/contexts/WorkContext';
import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { Briefcase, MapPin, CheckCircle, ArrowRight, FileText, Truck, List, Calendar as CalendarIcon, Shield, Ban, Clock, Grip } from 'lucide-react';
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
import { TasksCalendar } from '@/components/work/TasksCalendar';
import { IncidentCard } from '@/components/work/IncidentCard';
import { ManualViewer } from '@/components/work/ManualViewer';
import { useSearchParams } from 'react-router-dom';

export function TasksPage() {
  const { agent } = useAuth();
  const { processedIncidents, acceptIncident } = useWork();
  const { triggeredIds } = useInteraction();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Manual View State
  const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
  const [showManualDialog, setShowManualDialog] = useState(false);

  if (!agent) return null;

  const department = agent.department;

  // Filter incidents
  const incidents = processedIncidents.filter(inc => {
    if (inc.id === 'inc-sinkhole-001') {
      return triggeredIds.includes(inc.id);
    }
    return true;
  });

  const getTasksByDepartment = () => {
    switch (department) {
      case 'baekho':
        return {
          list: incidents.filter(inc => inc.status === '접수'),
          assigned: incidents.filter(inc => inc.status === '조사중'),
          listLabel: '요청 목록',
          assignedLabel: '나의 업무',
        };
      case 'hyunmu':
        return {
          list: incidents.filter(inc => inc.status === '구조대기'),
          assigned: incidents.filter(inc => inc.status === '구조중'),
          listLabel: '요청 목록',
          assignedLabel: '나의 업무',
        };
      case 'jujak':
        return {
          list: incidents.filter(inc => inc.status === '정리대기'),
          assigned: incidents.filter(inc => inc.status === '정리중'),
          listLabel: '요청 목록',
          assignedLabel: '나의 업무',
        };
      default:
        return { list: [], assigned: [], listLabel: '', assignedLabel: '' };
    }
  };

  const tasks = getTasksByDepartment();

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

  const handleManualClick = (manualId: string) => {
    setSelectedManualId(manualId);
    setShowManualDialog(true);
  };

  const getActionButton = () => {
    switch (department) {
      case 'baekho': return { label: '조사 시작', icon: FileText };
      case 'hyunmu': return { label: '출동 승낙', icon: Truck };
      case 'jujak': return { label: '정리 시작', icon: CheckCircle };
      default: return { label: '업무 시작', icon: ArrowRight };
    }
  };

  const action = getActionButton();

  return (
    <MainLayout>
      <Tabs defaultValue={defaultTab} className="w-full space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
            <Briefcase className="w-6 h-6 text-primary" />
            담당 업무
          </h1>

          <TabsList className="grid grid-cols-2 w-[180px] sm:w-[220px] h-9 bg-muted/50 border border-border/40 rounded-sm p-0.5">
            <TabsTrigger
              value="list"
              className="h-full gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-[3px] transition-all text-[11px] sm:text-xs"
            >
              <List className="w-3.5 h-3.5" />
              목록
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="h-full gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-[3px] transition-all text-[11px] sm:text-xs"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              캘린더
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* 1. Assigned Tasks (Moved to top) */}
            <section className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <h2 className="text-base font-bold flex items-center gap-2">
                  {tasks.assignedLabel}
                  <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px]">{tasks.assigned.length}</Badge>
                </h2>
              </div>

              <Card className="border border-border/60 shadow-sm bg-white overflow-hidden flex-1 flex flex-col">
                <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
                  <div className="hidden md:grid table-header-gov grid-cols-[1.2fr_1.2fr_4fr_1.5fr] gap-2 p-3 border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground shrink-0">
                    <div className="text-center">등급</div>
                    <div className="text-center">상태</div>
                    <div>내용</div>
                    <div className="text-center">작업</div>
                  </div>

                  <div className="divide-y divide-border/40 overflow-auto flex-1 h-0">
                    {tasks.assigned.length > 0 ? (
                      tasks.assigned.map((incident) => (
                        <div key={incident.id} className="group hover:bg-muted/30 transition-colors">
                          {/* Mobile */}
                          <div className="md:hidden p-2">
                            <IncidentCard
                              incident={incident}
                              onManualClick={handleManualClick}
                              onClick={() => { setSelectedIncident(incident); setShowDetailDialog(true); }}
                              showAction={true}
                              actionLabel="보고서"
                              onActionClick={() => { }}
                            />
                          </div>

                          {/* Desktop */}
                          <div
                            className="hidden md:grid grid-cols-[1.2fr_1.2fr_4fr_1.5fr] gap-2 p-3 items-center cursor-pointer"
                            onClick={() => { setSelectedIncident(incident); setShowDetailDialog(true); }}
                          >
                            <div className="text-center">
                              <Badge className={`${DANGER_LEVEL_STYLE[incident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[incident.dangerLevel].textClass} border-none rounded-[4px] px-1.5 h-6 min-w-[40px] justify-center text-xs`}>
                                {incident.dangerLevel}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <Badge className={`${STATUS_STYLE[incident.status].bgClass} ${STATUS_STYLE[incident.status].textClass} border-none rounded-[4px] px-1.5 h-6 min-w-[50px] justify-center text-xs`}>
                                {incident.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 min-w-0 pr-2">
                              <div className="font-medium text-foreground/90 truncate text-sm group-hover:text-primary transition-colors">{incident.title}</div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate">{incident.caseNumber}</div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <MapPin className="w-3 h-3" />
                                {incident.location}
                              </div>
                            </div>
                            <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="h-7 text-xs px-2 bg-blue-900 hover:bg-blue-800 text-white whitespace-nowrap">보고서</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted-foreground text-sm">배정된 업무가 없습니다.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 2. Requests List (Moved to bottom) */}
            <section className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <Grip className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-bold flex items-center gap-2">
                  {tasks.listLabel}
                  <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px]">{tasks.list.length}</Badge>
                </h2>
              </div>

              <Card className="border border-border/60 shadow-sm bg-white overflow-hidden flex-1 flex flex-col">
                <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
                  <div className="hidden md:grid table-header-gov grid-cols-[1.2fr_1.2fr_4fr_1.5fr] gap-2 p-3 border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground shrink-0">
                    <div className="text-center">등급</div>
                    <div className="text-center">상태</div>
                    <div>내용</div>
                    <div className="text-center">작업</div>
                  </div>

                  <div className="divide-y divide-border/40 overflow-auto flex-1 h-0">
                    {tasks.list.length > 0 ? (
                      tasks.list.map((incident) => (
                        <div key={incident.id} className="group hover:bg-muted/30 transition-colors">
                          {/* Mobile */}
                          <div className="md:hidden p-2">
                            <IncidentCard
                              incident={incident}
                              showAction={department === 'hyunmu'}
                              onActionClick={(inc) => { setSelectedIncident(inc); setShowAcceptDialog(true); }}
                              actionLabel={action.label}
                              department={department}
                              onManualClick={handleManualClick}
                              onClick={() => { setSelectedIncident(incident); setShowDetailDialog(true); }}
                            />
                          </div>

                          {/* Desktop */}
                          <div
                            className="hidden md:grid grid-cols-[1.2fr_1.2fr_4fr_1.5fr] gap-2 p-3 items-center cursor-pointer"
                            onClick={() => { setSelectedIncident(incident); setShowDetailDialog(true); }}
                          >
                            <div className="text-center">
                              <Badge className={`${DANGER_LEVEL_STYLE[incident.dangerLevel].bgClass} ${DANGER_LEVEL_STYLE[incident.dangerLevel].textClass} border-none rounded-[4px] px-1.5 h-6 min-w-[40px] justify-center text-xs`}>
                                {incident.dangerLevel}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <Badge className={`${STATUS_STYLE[incident.status].bgClass} ${STATUS_STYLE[incident.status].textClass} border-none rounded-[4px] px-1.5 h-6 min-w-[50px] justify-center text-xs`}>
                                {incident.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 min-w-0 pr-2">
                              <div className="font-medium text-foreground/90 truncate text-sm group-hover:text-primary transition-colors">{incident.title}</div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate">{incident.caseNumber}</div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <MapPin className="w-3 h-3" />
                                {incident.location}
                              </div>
                            </div>
                            <div className="flex justify-center">
                              {department === 'hyunmu' && (
                                <Button size="sm" className="h-7 text-xs px-2 bg-primary hover:bg-primary/90 whitespace-nowrap" onClick={() => { setSelectedIncident(incident); setShowAcceptDialog(true); }}>
                                  {action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted-foreground text-sm">대기 중인 업무가 없습니다.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
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

      {/* 재난 상세 다이얼로그 - reuse existing layout */}
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

              {/* 파훼법 */}
              {selectedIncident.countermeasure && (
                <div className="p-3 border border-success/30 rounded-sm bg-success/5">
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
              </div>
            </div>
          )}

          <DialogFooter className="flex-row sm:justify-end">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManualViewer
        manualId={selectedManualId}
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />
    </MainLayout >
  );
}

export default TasksPage;
