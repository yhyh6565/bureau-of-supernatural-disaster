import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useUser } from '@/contexts/UserContext';
import { Activity, Brain, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { STATUS_MAP } from '@/constants/haetae';

export function AgentStatusWidget() {
    const { agent } = useAuthStore();
    const { contamination } = useUser();

    if (!agent) return null;

    // Determine status color based on contamination
    const getStatusColor = (value: number) => {
        if (value >= 80) return 'text-destructive';
        if (value >= 50) return 'text-warning';
        return 'text-success';
    };

    const getStatusLabel = (value: number) => {
        if (value >= 80) return '위험 (격리 필요)';
        if (value >= 50) return '주의 (휴식 권장)';
        return '정상 (작전 가능)';
    };

    const colorClass = getStatusColor(contamination);

    return (
        <Card className="card-gov h-fit">
            <CardHeader className="pb-1.5">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    요원 상태 모니터
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mental Contamination */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Brain className="w-3 h-3" />
                            정신 오염도
                        </span>
                        <span className={`font-mono font-bold ${colorClass}`}>
                            {contamination}%
                        </span>
                    </div>
                    <Progress value={contamination} className="h-2"
                        indicatorClassName={
                            contamination >= 80 ? 'bg-destructive' :
                                contamination >= 50 ? 'bg-warning' : 'bg-success'
                        }
                    />
                    <p className={`text-xs text-right font-medium ${colorClass}`}>
                        {getStatusLabel(contamination)}
                    </p>
                </div>

                {/* Physical Status */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        신체 상태
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-accent rounded text-foreground">
                        {STATUS_MAP[agent.status] || agent.status}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
