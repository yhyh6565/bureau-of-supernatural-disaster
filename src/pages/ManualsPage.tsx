import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataManager } from '@/data/dataManager';
import { ManualContentDisplay } from '@/components/manual/ManualContentDisplay';
import { ManualCommentSection } from '@/components/manual/ManualCommentSection';
import { Search, Book, ChevronRight, ArrowLeft } from 'lucide-react';
import { DANGER_LEVEL_STYLE } from '@/constants/haetae';
import { useBureau } from '@/contexts/BureauContext';

export default function ManualsPage() {
    const [searchParams] = useSearchParams();
    const [selectedManualId, setSelectedManualId] = useState<string | null>(searchParams.get('id'));
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedManualId(id);
        }
    }, [searchParams]);



    const { mode } = useBureau();

    // If 'segwang' mode, hide all manuals
    if (mode === 'segwang') {
        return (
            <MainLayout>
                <div className="flex flex-col h-[calc(100vh-8rem)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">재난 대응 매뉴얼</h1>
                            <p className="text-muted-foreground">초자연 재난관리국 공식 대응 지침 문서 보관소</p>
                        </div>
                    </div>

                    <Card className="flex-1 flex items-center justify-center border-t-2 border-t-destructive/50 rounded-none shadow-sm bg-muted/10">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-destructive mt-8">접근 권한 없음</h3>
                            <p className="text-sm text-muted-foreground">
                                해당 문서는 현재 보안 등급으로 인해 열람할 수 없습니다.<br />
                                관리자에게 문의하십시오.
                            </p>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const allManuals = DataManager.getManuals ? DataManager.getManuals() : [];
    const incidents = DataManager.getIncidents ? DataManager.getIncidents(null) : []; // Fetch global incidents

    // Helper to get first registration date from related incidents
    const getFirstRegistrationDate = (manualId: string) => {
        // 1. Find incident with manualId
        const linkedIncident = incidents.find(inc => inc.manualId === manualId);
        if (linkedIncident) return linkedIncident.createdAt;

        // 2. Or check if manual has relatedIncidentIds (reverse lookup)
        const manual = allManuals.find(m => m.id === manualId);
        if (manual?.relatedIncidentIds && manual.relatedIncidentIds.length > 0) {
            // Find earliest incident among related ones
            const relatedIncidents = incidents.filter(inc => manual.relatedIncidentIds?.includes(inc.id));
            if (relatedIncidents.length > 0) {
                return relatedIncidents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0].createdAt;
            }
        }
        return null;
    };

    // Filter
    const filteredManuals = allManuals.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedManual = selectedManualId ? allManuals.find(m => m.id === selectedManualId) : null;

    if (selectedManual) {
        return (
            <MainLayout>
                <div className="space-y-4 max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => setSelectedManualId(null)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="w-4 h-4" />
                        매뉴얼 목록으로 돌아가기
                    </Button>

                    <Card className="min-h-[80vh] border-t-4 border-t-primary shadow-md">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className={`${DANGER_LEVEL_STYLE[selectedManual.severity]?.bgClass || 'bg-gray-500'} ${DANGER_LEVEL_STYLE[selectedManual.severity]?.textClass || 'text-white'} mb-2 border-none`}>
                                        {selectedManual.severity}
                                    </Badge>
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        {selectedManual.title}
                                    </CardTitle>
                                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-mono whitespace-nowrap">
                                        최초 등록일: {getFirstRegistrationDate(selectedManual.id) ? new Date(getFirstRegistrationDate(selectedManual.id)!).toLocaleDateString() : '-'} | 최종개정: {new Date(selectedManual.lastUpdated).toLocaleDateString()}
                                    </p>
                                </div>
                                <Book className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6">
                                <ManualContentDisplay manual={selectedManual} />
                                <ManualCommentSection manualId={selectedManual.id} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Book className="w-6 h-6 text-primary" />
                        재난 대응 매뉴얼
                    </h1>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="매뉴얼 제목 또는 번호 검색..."
                            className="pl-9 w-full md:w-[300px] bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List - "Public Enterprise Style" Table */}
                <Card className="flex-1 overflow-hidden border-t-2 border-t-black/80 rounded-none shadow-sm">
                    <div className="overflow-auto h-full">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100/50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 md:px-6 py-3 w-[60px] md:w-[100px] text-center md:text-left">등급</th>
                                    <th className="px-2 md:px-6 py-3">
                                        <span className="hidden md:inline">매뉴얼 제목</span>
                                        <span className="md:hidden">제목</span>
                                    </th>
                                    <th className="px-2 md:px-6 py-3 w-[80px] md:w-[150px] text-center">
                                        <span className="hidden md:inline">최초 등록일</span>
                                        <span className="md:hidden">등록</span>
                                    </th>
                                    <th className="px-2 md:px-6 py-3 w-[80px] md:w-[150px] text-center">
                                        <span className="hidden md:inline">최근 업데이트</span>
                                        <span className="md:hidden">수정</span>
                                    </th>
                                    <th className="px-2 md:px-6 py-3 w-[30px] md:w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredManuals.length > 0 ? (
                                    filteredManuals.map((manual) => {
                                        const firstRegDate = getFirstRegistrationDate(manual.id);
                                        const dangerStyle = DANGER_LEVEL_STYLE[manual.severity];

                                        return (
                                            <tr
                                                key={manual.id}
                                                className="bg-white hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                                onClick={() => setSelectedManualId(manual.id)}
                                            >
                                                <td className="px-2 md:px-6 py-4 text-center md:text-left">
                                                    <Badge className={`${dangerStyle?.bgClass || 'bg-gray-500'} ${dangerStyle?.textClass || 'text-white'} border-none hover:opacity-80 whitespace-nowrap`}>
                                                        {manual.severity}
                                                    </Badge>
                                                </td>
                                                <td className="px-2 md:px-6 py-4 font-medium text-gray-900 group-hover:text-blue-700 break-keep">
                                                    {manual.title}
                                                </td>
                                                <td className="px-2 md:px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                                    <span className="hidden md:inline">
                                                        {firstRegDate ? new Date(firstRegDate).toLocaleDateString() : '-'}
                                                    </span>
                                                    <span className="md:hidden">
                                                        {firstRegDate ? `${new Date(firstRegDate).getFullYear()}..` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-2 md:px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                                    <span className="hidden md:inline">
                                                        {new Date(manual.lastUpdated).toLocaleDateString()}
                                                    </span>
                                                    <span className="md:hidden">
                                                        {new Date(manual.lastUpdated).getFullYear()}..
                                                    </span>
                                                </td>
                                                <td className="px-2 md:px-6 py-4 text-center">
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
