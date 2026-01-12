import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentBoard } from '@/components/incidents/IncidentBoard';
import { useAuthStore } from '@/store/authStore';
import { Incident } from '@/types/haetae';
import { DANGER_LEVEL_STYLE, STATUS_STYLE } from '@/constants/haetae';
import { AlertTriangle, MapPin, Clock, Shield, Ban, Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DeletedRecordModal } from '@/components/segwang/DeletedRecordModal';
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
import { formatSegwangDate } from '@/utils/dateUtils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useInteractionStore } from '@/store/interactionStore';
import { useWorkData } from '@/hooks/useWorkData';
import { useBureauStore } from '@/store/bureauStore';
import { DataManager } from '@/data/dataManager';

type GroupBy = 'status' | 'dangerLevel';

export default function IncidentsPage() {
    const { agent } = useAuthStore();
    const { mode } = useBureauStore();
    const { triggeredIds, newlyTriggeredId, clearNewTrigger } = useInteractionStore();
    const { processedIncidents } = useWorkData();
    const navigate = useNavigate();

    useEffect(() => {
        return () => clearNewTrigger();
    }, []);

    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    // Easter Egg Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeletedRecordModal, setShowDeletedRecordModal] = useState(false);

    const handleSearch = (query: string) => {
        const triggerKeywords = [
            '세광', '세광특별시', '특별시',
            '0000PSYA.2024.세00', '0000PSYA.20██.세00',
            '삭제된 지역', '기억 소각', '5월 4일', '멸형급 552'
        ];

        if (triggerKeywords.some(keyword => query.includes(keyword))) {
            setShowDeletedRecordModal(true);
        }
    };


    // Clear search query when entering Segwang mode
    useEffect(() => {
        if (mode === 'segwang') {
            setSearchQuery('');
        }
    }, [mode]);

    const baseIncidents = mode === 'segwang'
        ? DataManager.getIncidents(null)
        : processedIncidents;

    const incidents = baseIncidents
        .filter(inc => {
            if (inc.id === 'inc-sinkhole-001') {
                return triggeredIds.includes(inc.id);
            }
            return true;
        })
        .filter(inc => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                (inc.title || '').toLowerCase().includes(query) ||
                (inc.location || '').toLowerCase().includes(query) ||
                (inc.caseNumber || '').toLowerCase().includes(query) ||
                (inc.reportContent || '').toLowerCase().includes(query)
            );
        });

    const handleManualClick = (manualId: string) => {
        navigate(`/manuals?id=${manualId}`);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* 제목 영역 (좌측) */}
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">재난 현황</h1>

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

                    {/* 컨트롤 영역 (우측: 검색창 + 필터) */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch(searchQuery);
                            }}
                            className="flex bg-muted/30 p-1 rounded-lg flex-1 md:flex-none"
                        >
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="재난 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-[200px] pl-9 h-8 bg-background/50 border-0 focus-visible:ring-1 transition-all text-xs"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap hidden md:inline">그룹:</span>
                            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                                <SelectTrigger className="w-[100px] md:w-32 h-10 md:h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="status">처리 상태</SelectItem>
                                    <SelectItem value="dangerLevel">위험 등급</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <IncidentBoard
                        incidents={incidents}
                        groupBy={groupBy}
                        onCardClick={setSelectedIncident}
                        onManualClick={mode === 'segwang' ? undefined : handleManualClick}
                        highlightId={newlyTriggeredId}
                    />
                </div>
            </div>

            {/* 재난 상세 모달 */}
            <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            재난 상세 정보
                            {selectedIncident && (
                                <>
                                    <Badge className={`${(DANGER_LEVEL_STYLE[selectedIncident.dangerLevel] || DANGER_LEVEL_STYLE['등급불명']).bgClass} ${(DANGER_LEVEL_STYLE[selectedIncident.dangerLevel] || DANGER_LEVEL_STYLE['등급불명']).textClass}`}>
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
                                    <span>접수: {formatSegwangDate(selectedIncident.createdAt, 'yyyy.MM.dd HH:mm', mode === 'segwang')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>업데이트: {formatSegwangDate(selectedIncident.updatedAt, 'yyyy.MM.dd HH:mm', mode === 'segwang')}</span>
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

            {/* 세광특별시 이스터에그 모달 - ordinary 모드일 때만 렌더링 */}
            {mode === 'ordinary' && (
                <DeletedRecordModal
                    isOpen={showDeletedRecordModal}
                    onClose={() => setShowDeletedRecordModal(false)}
                    searchQuery={searchQuery}
                />
            )}
        </MainLayout>
    );
}
