import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApprovalDocument } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { useWork } from '@/contexts/WorkContext';
import { ClipboardCheck, FileText, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getPersonaName } from '@/constants/haetae';

type ApprovalStatus = '작성중' | '결재대기' | '승인' | '반려';

const STATUS_STYLE: Record<ApprovalStatus, { bg: string; text: string; icon: React.ElementType }> = {
  '작성중': { bg: 'bg-muted', text: 'text-muted-foreground', icon: FileText },
  '결재대기': { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  '승인': { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle },
  '반려': { bg: 'bg-destructive/10', text: 'text-destructive', icon: XCircle },
};

export function ApprovalsPage() {
  const { agent } = useAuth();
  const { approvals } = useWork();
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
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </div>

        <Card className="card-gov pb-12">
          <CardHeader className="border-b border-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedApproval.type}</Badge>
                <Badge className={`${style.bg} ${style.text}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {selectedApproval.status}
                </Badge>
              </div>
              <CardTitle className="text-base">{selectedApproval.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>기안자: {getPersonaName(selectedApproval.createdByName) || selectedApproval.createdByName}</span>
                <span>|</span>
                <span>결재자: {selectedApproval.approverName}</span>
                <span>|</span>
                <span>기안일: {format(new Date(selectedApproval.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">내용</h3>
              <div className="p-4 bg-muted/50 rounded-sm border border-border">
                <p className="whitespace-pre-wrap">{selectedApproval.content}</p>
              </div>
            </div>

            {selectedApproval.status === '반려' && selectedApproval.rejectReason && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-destructive">반려 사유</h3>
                <div className="p-4 bg-destructive/10 rounded-sm border border-destructive/20">
                  <p className="text-sm">{selectedApproval.rejectReason}</p>
                </div>
              </div>
            )}

            {selectedApproval.processedAt && (
              <div className="text-sm text-muted-foreground">
                처리일: {format(new Date(selectedApproval.processedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
              </div>
            )}

            {selectedApproval.status === '작성중' && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button>결재 상신</Button>
                <Button variant="outline">수정</Button>
                <Button variant="destructive">삭제</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Tabs defaultValue="my" className="pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="my" className="gap-2">
              내 기안 문서
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">결재 대기함</TabsTrigger>
            <TabsTrigger value="completed">결재 완료함</TabsTrigger>
          </TabsList>

          <Button className="gap-2 w-full sm:w-auto">
            <FileText className="w-4 h-4" />
            새 문서 작성
          </Button>
        </div>

        <TabsContent value="my">
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                내가 기안한 문서
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-sm overflow-hidden">
                {/* Desktop Table Header - Hidden on mobile */}
                <div className="hidden md:grid table-header-gov grid-cols-12 gap-2 p-3">
                  <div className="col-span-2 text-center">문서유형</div>
                  <div className="col-span-5">제목</div>
                  <div className="col-span-2 text-center">결재자</div>
                  <div className="col-span-2 text-center">기안일</div>
                  <div className="col-span-1 text-center">상태</div>
                </div>

                {myDocuments.length > 0 ? (
                  myDocuments.map((doc) => {
                    const style = STATUS_STYLE[doc.status];
                    const StatusIcon = style.icon;

                    return (
                      <div
                        key={doc.id}
                        className="border-t border-border cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedApproval(doc)}
                      >
                        {/* Mobile Card Layout */}
                        <div className="md:hidden p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                <Badge className={`${style.bg} ${style.text} text-xs`}>
                                  {doc.status}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-sm">{doc.title}</h3>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>결재자: {doc.approverName}</div>
                            <div>기안일: {format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}</div>
                          </div>
                        </div>

                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-2 p-3">
                          <div className="col-span-2 text-center">
                            <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                          </div>
                          <div className="col-span-5 truncate">{doc.title}</div>
                          <div className="col-span-2 text-center text-sm text-muted-foreground">
                            {doc.approverName}
                          </div>
                          <div className="col-span-2 text-center text-sm text-muted-foreground">
                            {format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}
                          </div>
                          <div className="col-span-1 text-center">
                            <Badge className={`${style.bg} ${style.text} text-xs`}>
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    기안한 문서가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                결재 대기함
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const pendingForMe = approvals.filter(
                  a => a.status === '결재대기' && (
                    a.approver === agent?.id || a.approver === agent?.personaKey ||
                    a.createdBy === agent?.id || a.createdBy === agent?.personaKey
                  )
                );

                if (pendingForMe.length === 0) {
                  return (
                    <div className="p-8 text-center text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>결재 대기 중인 문서가 없습니다.</p>
                    </div>
                  );
                }

                return (
                  <div className="border border-border rounded-sm overflow-hidden">
                    {pendingForMe.map((doc) => {
                      const style = STATUS_STYLE[doc.status];
                      return (
                        <div
                          key={doc.id}
                          className="border-b last:border-b-0 border-border cursor-pointer hover:bg-accent/50 transition-colors p-4"
                          onClick={() => setSelectedApproval(doc)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                <Badge className={`${style.bg} ${style.text} text-xs`}>{doc.status}</Badge>
                              </div>
                              <h3 className="font-medium text-sm">{doc.title}</h3>
                              <div className="text-sm text-muted-foreground">
                                기안자: {getPersonaName(doc.createdByName) || doc.createdByName} | 기안일: {format(new Date(doc.createdAt), 'yyyy.MM.dd', { locale: ko })}
                              </div>
                            </div>
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
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                결재 완료함
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const completedByMe = approvals.filter(
                  a => (a.status === '승인' || a.status === '반려') && (
                    a.approver === agent?.id || a.approver === agent?.personaKey ||
                    a.createdBy === agent?.id || a.createdBy === agent?.personaKey
                  )
                );

                if (completedByMe.length === 0) {
                  return (
                    <div className="p-8 text-center text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>결재 완료된 문서가 없습니다.</p>
                    </div>
                  );
                }

                return (
                  <div className="border border-border rounded-sm overflow-hidden">
                    {completedByMe.map((doc) => {
                      const style = STATUS_STYLE[doc.status];
                      return (
                        <div
                          key={doc.id}
                          className="border-b last:border-b-0 border-border cursor-pointer hover:bg-accent/50 transition-colors p-4"
                          onClick={() => setSelectedApproval(doc)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                <Badge className={`${style.bg} ${style.text} text-xs`}>{doc.status}</Badge>
                              </div>
                              <h3 className="font-medium text-sm">{doc.title}</h3>
                              <div className="text-sm text-muted-foreground">
                                기안자: {getPersonaName(doc.createdByName) || doc.createdByName} | 처리일: {doc.processedAt ? format(new Date(doc.processedAt), 'yyyy.MM.dd', { locale: ko }) : '-'}
                              </div>
                            </div>
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
    </MainLayout>
  );
}

export default ApprovalsPage;
