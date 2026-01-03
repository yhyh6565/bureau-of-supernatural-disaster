import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentBoard } from '@/components/incidents/IncidentBoard';
import { ManualViewer } from '@/components/work/ManualViewer';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { AlertTriangle, LayoutGrid, Layers, MapPin, Clock, Shield, Ban } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type GroupBy = 'status' | 'dangerLevel';

import { useInteraction } from '@/contexts/InteractionContext';
import { useEffect } from 'react';

// ...

export default function IncidentsPage() {
    const { agent } = useAuth();
    const { triggeredIds, newlyTriggeredId, clearNewTrigger } = useInteraction();

    // Clear the "newly triggered" state shortly after viewing to stop animation re-runs eventually?
    // Actually we keep it until page leave or manual clear. 
    // Effect to clear "New" flag when unmounting or changing pages? 
    // Maybe we just use it for the className.

    useEffect(() => {
        return () => clearNewTrigger();
    }, []);

    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
    const [showManualDialog, setShowManualDialog] = useState(false);

    const incidents = DataManager.getIncidents(agent)
        .filter(inc => {
            // Special handling for Sinkhole: Show only if triggered
            if (inc.id === 'inc-sinkhole-001') {
                return triggeredIds.includes(inc.id);
            }
            return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleManualClick = (manualId: string) => {
        setSelectedManualId(manualId);
        setShowManualDialog(true);
    };

    return (
        <MainLayout>
            <div className="space-y-4">
                {/* 페이지 헤더 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h1 className="text-xl font-bold">재난 현황</h1>
                        <span className="text-sm text-muted-foreground">
                            (총 {incidents.length}건)
                        </span>
                    </div>

                    {/* 그룹핑 선택 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">그룹 기준:</span>
                        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="status">
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4" />
                                        <span>처리 상태</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="dangerLevel">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4" />
                                        <span>위험 등급</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 칸반 보드 */}
                <IncidentBoard
                    incidents={incidents}
                    groupBy={groupBy}
                    onCardClick={setSelectedIncident}
                    onManualClick={handleManualClick}
                    highlightId={newlyTriggeredId}
                />
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
                                    <Badge className={`${(DANGER_LEVEL_STYLE[selectedIncident.dangerLevel] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' }).bgClass} ${(DANGER_LEVEL_STYLE[selectedIncident.dangerLevel] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' }).textClass}`}>
                                        {selectedIncident.dangerLevel}
                                    </Badge>
                                    <Badge className={`${(STATUS_STYLE[selectedIncident.status] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' }).bgClass} ${(STATUS_STYLE[selectedIncident.status] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' }).textClass}`}>
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
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
