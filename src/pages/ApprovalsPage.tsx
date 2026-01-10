import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApprovalDocument } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuthStore } from '@/store/authStore';
import { useWorkData } from '@/hooks/useWorkData';
import { ClipboardCheck, FileText, Clock, CheckCircle, XCircle, ArrowLeft, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getPersonaName } from '@/constants/haetae';

type ApprovalStatus = '작성중' | '결재대기' | '승인' | '반려';

const STATUS_STYLE: Record<ApprovalStatus, { bg: string; text: string; icon: React.ElementType }> = {
  '작성중': { bg: 'bg-muted', text: 'text-muted-foreground', icon: FileText },
  '결재대기': { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  '승인': { bg: 'bg-blue-50', text: 'text-blue-600', icon: CheckCircle },
  '반려': { bg: 'bg-destructive/10', text: 'text-destructive', icon: XCircle },
};

export function ApprovalsPage() {
  const { agent } = useAuthStore();
  const { approvals } = useWorkData();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDocument | null>(null);

  const myDocuments = approvals.filter(a => a.createdBy === agent?.personaKey || a.createdBy === agent?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingCount = myDocuments.filter(a => a.status === '결재대기').length;

  if (selectedApproval) {
    const style = STATUS_STYLE[selectedApproval.status];
    const StatusIcon = style.icon;

    return (
      <MainLayout>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedApproval(null)}
            className="gap-2 mb-4 hover:bg-transparent pl-0 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Button>
        </div>

        <Card className="card-gov pb-12 border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/10 pb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-muted-foreground border-border bg-white">{selectedApproval.type}</Badge>
                <Badge className={`${style.bg} ${style.text} border-none`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {selectedApproval.status}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">{selectedApproval.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground/80">기안자:</span> {getPersonaName(selectedApproval.createdByName) || selectedApproval.createdByName}
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground/80">결재자:</span> {selectedApproval.approverName}
                </div>
                <div className="w-px h-3 bg-border" />
                <div>{format(new Date(selectedApproval.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">상세 내용</h3>
              <div className="p-6 bg-white rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap shadow-sm min-h-[200px]">
                {selectedApproval.content}
              </div>
            </div>

            {selectedApproval.status === '반려' && selectedApproval.rejectReason && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">반려 사유</h3>
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 text-sm text-destructive">
                  {selectedApproval.rejectReason}
                </div>
              </div>
            )}

            {selectedApproval.processedAt && (
              <div className="text-xs text-right text-muted-foreground font-mono">
                처리일시: {format(new Date(selectedApproval.processedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
              </div>
            )}

            {selectedApproval.status === '작성중' && (
              <div className="flex gap-2 pt-6 border-t border-border">
                <Button className="bg-primary hover:bg-primary/90">결재 상신</Button>
                <Button variant="outline">수정</Button>
                <Button variant="destructive" className="ml-auto">삭제</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            전자결재
          </h1>
          <Button className="h-8 text-xs gap-2 w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white shadow-sm">
            <PenLine className="w-3.5 h-3.5" />
            새 문서 기안
          </Button>
        </div>

        <Tabs defaultValue="my" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-10 bg-white border border-border/60 rounded-sm p-1 mb-4">
            <TabsTrigger
              value="my"
              className="h-full gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all text-sm"
            >
              <FileText className="w-4 h-4" />
              내 기안 문서
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="h-full gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all text-sm"
            >
              <Clock className="w-4 h-4" />
              결재 대기함
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="h-full gap-2 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              결재 완료함
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my">
            <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="hidden md:grid table-header-gov grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                  <div className="text-center">문서유형</div>
                  <div>제목</div>
                  <div className="text-center">결재자</div>
                  <div className="text-center">기안일</div>
                  <div className="text-center">상태</div>
                </div>

                <div className="divide-y divide-border/40">
                  {myDocuments.length > 0 ? (
                    myDocuments.map((doc) => {
                      const style = STATUS_STYLE[doc.status];

                      return (
                        <div
                          key={doc.id}
                          className="group hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedApproval(doc)}
                        >
                          {/* Mobile */}
                          <div className="md:hidden p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-white">{doc.type}</Badge>
                                  <Badge className={`${style.bg} ${style.text} text-[10px] px-1.5 h-5 rounded-[4px] border-none`}>
                                    {doc.status}
                                  </Badge>
                                </div>
                                <h3 className="font-medium text-foreground">{doc.title}</h3>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                              <span>결재자: {doc.approverName}</span>
                              <span>{format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}</span>
                            </div>
                          </div>

                          {/* Desktop */}
                          <div className="hidden md:grid grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 items-center">
                            <div className="text-center">
                              <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-white border-border/60">{doc.type}</Badge>
                            </div>
                            <div className="font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">{doc.title}</div>
                            <div className="text-center text-sm text-foreground/70">
                              {doc.approverName}
                            </div>
                            <div className="text-center text-sm text-muted-foreground font-mono">
                              {format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}
                            </div>
                            <div className="text-center">
                              <Badge className={`${style.bg} ${style.text} text-xs border-none rounded-[4px] px-2 h-6 min-w-[60px] justify-center`}>
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-muted-foreground text-sm">기안한 문서가 없습니다.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Reuse table structure for simplicity */}
                <div className="hidden md:grid table-header-gov grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                  <div className="text-center">문서유형</div>
                  <div>제목</div>
                  <div className="text-center">기안자</div>
                  <div className="text-center">기안일</div>
                  <div className="text-center">상태</div>
                </div>

                {(() => {
                  const pendingForMe = approvals.filter(
                    a => a.status === '결재대기' && (
                      a.approver === agent?.id || a.approver === agent?.personaKey ||
                      a.createdBy === agent?.id || a.createdBy === agent?.personaKey
                    )
                  );

                  if (pendingForMe.length === 0) {
                    return <div className="p-12 text-center text-muted-foreground text-sm">결재 대기 중인 문서가 없습니다.</div>;
                  }

                  return (
                    <div className="divide-y divide-border/40">
                      {pendingForMe.map((doc) => {
                        const style = STATUS_STYLE[doc.status];
                        return (
                          <div
                            key={doc.id}
                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedApproval(doc)}
                          >
                            {/* Mobile */}
                            <div className="md:hidden p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-white">{doc.type}</Badge>
                                <Badge className={`${style.bg} ${style.text} border-none text-[10px]`}>{doc.status}</Badge>
                              </div>
                              <h3 className="font-medium">{doc.title}</h3>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>기안자: {getPersonaName(doc.createdByName) || doc.createdByName}</span>
                                <span>{format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}</span>
                              </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:grid grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 items-center">
                              <div className="text-center"><Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-white">{doc.type}</Badge></div>
                              <div className="font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">{doc.title}</div>
                              <div className="text-center text-sm text-foreground/70">{getPersonaName(doc.createdByName) || doc.createdByName}</div>
                              <div className="text-center text-sm text-muted-foreground font-mono">{format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}</div>
                              <div className="text-center"><Badge className={`${style.bg} ${style.text} text-xs border-none rounded-[4px] px-2 h-6 justify-center`}>{doc.status}</Badge></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="hidden md:grid table-header-gov grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                  <div className="text-center">문서유형</div>
                  <div>제목</div>
                  <div className="text-center">기안자</div>
                  <div className="text-center">처리일</div>
                  <div className="text-center">상태</div>
                </div>

                {(() => {
                  const completedByMe = approvals.filter(
                    a => (a.status === '승인' || a.status === '반려') && (
                      a.approver === agent?.id || a.approver === agent?.personaKey ||
                      a.createdBy === agent?.id || a.createdBy === agent?.personaKey
                    )
                  );

                  if (completedByMe.length === 0) {
                    return <div className="p-12 text-center text-muted-foreground text-sm">결재 완료된 문서가 없습니다.</div>;
                  }

                  return (
                    <div className="divide-y divide-border/40">
                      {completedByMe.map((doc) => {
                        const style = STATUS_STYLE[doc.status];
                        return (
                          <div
                            key={doc.id}
                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedApproval(doc)}
                          >
                            {/* Mobile */}
                            <div className="md:hidden p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-white">{doc.type}</Badge>
                                <Badge className={`${style.bg} ${style.text} border-none text-[10px]`}>{doc.status}</Badge>
                              </div>
                              <h3 className="font-medium text-foreground/80">{doc.title}</h3>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>기안자: {getPersonaName(doc.createdByName) || doc.createdByName}</span>
                                <span>{doc.processedAt ? format(new Date(doc.processedAt), 'yyyy.MM.dd', { locale: ko }) : '-'}</span>
                              </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:grid grid-cols-[1.5fr_5fr_1.5fr_1.5fr_1.5fr] gap-4 p-4 items-center">
                              <div className="text-center"><Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-white">{doc.type}</Badge></div>
                              <div className="font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">{doc.title}</div>
                              <div className="text-center text-sm text-foreground/70">{getPersonaName(doc.createdByName) || doc.createdByName}</div>
                              <div className="text-center text-sm text-muted-foreground font-mono">{doc.processedAt ? format(new Date(doc.processedAt), 'yyyy.MM.dd', { locale: ko }) : '-'}</div>
                              <div className="text-center"><Badge className={`${style.bg} ${style.text} text-xs border-none rounded-[4px] px-2 h-6 justify-center`}>{doc.status}</Badge></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default ApprovalsPage;
