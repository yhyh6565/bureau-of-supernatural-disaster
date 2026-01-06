import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWork } from '@/contexts/WorkContext';
import { useBureau } from '@/contexts/BureauContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { STATUS_STYLE } from '@/constants/haetae';
import { IncidentStatus } from '@/types/haetae';

const STATUS_ORDER: IncidentStatus[] = ['접수', '조사중', '구조대기', '구조중', '정리대기', '정리중', '종결', '봉인'];

export function IncidentSummary() {
    const { agent } = useAuth();
    const { processedIncidents } = useWork();
    const navigate = useNavigate();
    const incidents = processedIncidents;

    const { mode } = useBureau();

    // 상태별 카운트 계산
    const statusCounts = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = incidents.filter(inc => inc.status === status).length;
        return acc;
    }, {} as Record<IncidentStatus, number>);

    // 진행 중인 재난 수 (종결 제외. 단, 일반 모드에서는 봉인도 제외)
    // 세광 모드: '종결'과 '봉인'을 모두 포함하여 전체 재난 수 표시 (이스터에그 기록용)
    const activeCount = incidents.filter(inc => {
        if (mode === 'segwang') return true;

        if (inc.status === '종결') return false;
        if (inc.status === '봉인') return false;
        return true;
    }).length;

    return (
        <Card className="card-gov">
            <CardHeader className="pt-3 md:pt-6 pb-1.5 md:pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        재난 현황
                        <Badge variant="secondary" className="ml-2 text-xs">
                            {activeCount}건 진행 중
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        className="h-6 px-2 text-xs text-primary hover:text-primary"
                        onClick={() => navigate('/incidents')}
                    >
                        상세 보기
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STATUS_ORDER.map((status) => {
                        const style = STATUS_STYLE[status] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' };
                        const count = statusCounts[status];

                        return (
                            <div
                                key={status}
                                className={`p-2 rounded-sm border border-border flex items-center justify-between ${count > 0 ? 'opacity-100' : 'opacity-50'
                                    }`}
                            >
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${style.bgClass} ${style.textClass}`}>
                                    {status}
                                </span>
                                <span className="text-sm font-bold">
                                    {count}건
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
