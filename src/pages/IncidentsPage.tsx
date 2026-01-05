import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentBoard } from '@/components/incidents/IncidentBoard';
import { ManualViewer } from '@/components/work/ManualViewer';
import { useAuth } from '@/contexts/AuthContext';
import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { AlertTriangle, MapPin, Clock, Shield, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useInteraction } from '@/contexts/InteractionContext';
import { useWork } from '@/contexts/WorkContext';

type GroupBy = 'status' | 'dangerLevel';

export default function IncidentsPage() {
    const { agent } = useAuth();
    const { triggeredIds, newlyTriggeredId, clearNewTrigger } = useInteraction();
    const { processedIncidents } = useWork();

    useEffect(() => {
        return () => clearNewTrigger();
    }, []);

    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
    const [showManualDialog, setShowManualDialog] = useState(false);

    const incidents = processedIncidents
        .filter(inc => {
            if (inc.id === 'inc-sinkhole-001') {
                return triggeredIds.includes(inc.id);
            }
            return true;
        });

    const handleManualClick = (manualId: string) => {
        setSelectedManualId(manualId);
        setShowManualDialog(true);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <h1 className="text-xl font-bold tracking-tight">재난 현황</h1>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-5 w-5 rounded-full text-[10px] font-bold border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-foreground/50 transition-colors ml-2"
                                >
                                    !
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[90vw] max-w-[450px] p-0" align="start">
                                <div className="p-4 bg-muted/20 border-b">
                                    <h4 className="font-semibold leading-none mb-1">위험 등급 체계 (형刑 시스템)</h4>
                                    <p className="text-xs text-muted-foreground">초자연 재난관리국은 재난의 위험도를 4단계로 분류합니다.</p>
                                </div>
                                <div className="p-2">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b text-muted-foreground">
                                                <th className="h-8 px-2 text-left font-medium w-20">등급</th>
                                                <th className="h-8 px-2 text-left font-medium w-40">정의</th>
                                                <th className="h-8 px-2 text-left font-medium">특징</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2 font-bold text-purple-600">멸형</td>
                                                <td className="p-2">사망처리자 오십만 명 이상</td>
                                                <td className="p-2 text-muted-foreground">최고 위험 등급, 특수 장비 필수</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2 font-bold text-red-600">파형</td>
                                                <td className="p-2">수십 년간 수백 명 실종</td>
                                                <td className="p-2 text-muted-foreground">종결 불가, 봉인만 가능</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2 font-bold text-orange-500">뇌형</td>
                                                <td className="p-2">수십 년간 수십 명 피해</td>
                                                <td className="p-2 text-muted-foreground">봉인 가능, 장기 관찰 필요</td>
                                            </tr>
                                            <tr className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2 font-bold text-gray-500">고형</td>
                                                <td className="p-2">인명피해 없음</td>
                                                <td className="p-2 text-muted-foreground">낮은 위험도, 일반 대응 가능</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Badge variant="secondary" className="rounded-full px-2 ml-2">
                            {incidents.length}건
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">그룹:</span>
                        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status">처리 상태</SelectItem>
                                <SelectItem value="dangerLevel">위험 등급</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4">
                    <IncidentBoard
                        incidents={incidents}
                        groupBy={groupBy}
                        onCardClick={setSelectedIncident}
                        onManualClick={handleManualClick}
                        highlightId={newlyTriggeredId}
                    />
                </div>
            </div>

            {/* 매뉴얼 보기 모달 */}
            <ManualViewer
                manualId={selectedManualId}
                open={showManualDialog}
                onOpenChange={setShowManualDialog}
            />

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedIncident(null)}>
                            닫기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
