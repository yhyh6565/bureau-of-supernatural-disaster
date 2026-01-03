import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { STATUS_STYLE } from '@/constants/haetae';
import { IncidentStatus } from '@/types/haetae';

const STATUS_ORDER: IncidentStatus[] = ['접수', '조사중', '구조대기', '구조중', '정리대기', '정리중', '종결', '봉인'];

export function IncidentSummary() {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const incidents = DataManager.getIncidents(agent);

    // 상태별 카운트 계산
    const statusCounts = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = incidents.filter(inc => inc.status === status).length;
        return acc;
    }, {} as Record<IncidentStatus, number>);

    // 진행 중인 재난 수 (종결/봉인 제외)
    const activeCount = incidents.filter(inc => inc.status !== '종결' && inc.status !== '봉인').length;

    return (
        <Card className="card-gov">
            <CardHeader className="pt-6 pb-0">
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
