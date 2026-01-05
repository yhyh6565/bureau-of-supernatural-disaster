import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useResource } from '@/contexts/ResourceContext';
import { DEPARTMENT_INFO } from '@/constants/haetae';
import { User, Brain, Briefcase, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PersonalInfoWidget() {
    const { agent } = useAuth();
    const { contamination } = useUser();
    const { rentals } = useResource();

    if (!agent) return null;

    const deptInfo = DEPARTMENT_INFO[agent.department];

    // Determine contamination status color
    const getContaminationColor = (value: number) => {
        if (value >= 80) return 'text-destructive';
        if (value >= 50) return 'text-warning';
        return 'text-success';
    };

    const contaminationColor = getContaminationColor(contamination);

    return (
        <Card className="card-gov h-fit">
            <CardHeader className="pt-3 md:pt-6 pb-3 md:pb-6">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    개인 정보
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* 이름과 요원명 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">이름</span>
                        <p className="text-sm font-medium">{agent.name}</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">요원명</span>
                        <p className="text-sm font-bold text-primary">{agent.codename}</p>
                    </div>
                </div>

                {/* 소속/근무상태 */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">소속</span>
                        <div className="flex items-center gap-1">
                            <deptInfo.icon className="w-3 h-3" />
                            <p className="text-sm">{deptInfo.name}</p>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase">근무상태</span>
                        <p className="text-sm">{agent.status}</p>
                    </div>
                </div>

                {/* 정신오염도 */}
                <div className="pt-2 border-t border-border space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            정신오염도
                        </span>
                        <span className={`text-sm font-mono font-bold ${contaminationColor}`}>
                            {contamination}%
                        </span>
                    </div>
                    <Progress value={contamination} className="h-1.5"
                        indicatorClassName={
                            contamination >= 80 ? 'bg-destructive' :
                                contamination >= 50 ? 'bg-warning' : 'bg-success'
                        }
                    />
                </div>

                {/* 장비현황 */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        보유장비
                    </span>
                    <span className="text-sm font-medium">
                        {rentals.length}건
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
