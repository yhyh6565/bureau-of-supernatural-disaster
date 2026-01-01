import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { DataManager } from '@/data/dataManager';
import { Bell, FileText, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

export function AdminAlertWidget() {
    const { agent } = useAuth();

    if (!agent) return null;

    // 1. Pending Approvals
    const approvals = DataManager.getApprovals(agent);
    const pendingApprovals = approvals.filter(a => a.status === '결재대기' && a.createdBy === agent.id);

    // 2. Equipment Alerts (Overdue or Due Soon)
    const today = new Date();
    const urgentRentals = agent.rentals.filter(r => {
        if (r.status === '반납완료' || !r.dueDate) return false;
        const daysLeft = differenceInDays(new Date(r.dueDate), today);
        return daysLeft <= 3; // 3 days or less (includes negative for overdue)
    });

    const hasAlerts = pendingApprovals.length > 0 || urgentRentals.length > 0;

    return (
        <Card className="card-gov h-fit">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    행정 알림
                </CardTitle>
            </CardHeader>
            <CardContent>
                {hasAlerts ? (
                    <div className="space-y-3">
                        {/* Approval Alerts */}
                        {pendingApprovals.length > 0 && (
                            <div className="flex items-center justify-between p-2 rounded bg-accent/30 border border-border">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 opacity-70" />
                                    <span className="text-sm">결재 대기</span>
                                </div>
                                <Badge variant="secondary" className="font-mono">{pendingApprovals.length}건</Badge>
                            </div>
                        )}

                        {/* Equipment Alerts */}
                        {urgentRentals.map(item => {
                            const daysLeft = differenceInDays(new Date(item.dueDate!), today);
                            const isOverdue = daysLeft < 0;
                            return (
                                <div key={item.id} className={`flex items-start justify-between p-2 rounded border ${isOverdue ? 'bg-destructive/5 border-destructive/30' : 'bg-warning/5 border-warning/30'}`}>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 opacity-70" />
                                            <span className="text-sm font-medium">{item.equipmentName}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-5">
                                            {isOverdue ? `연체 ${Math.abs(daysLeft)}일 경과` : `반납 ${daysLeft}일 전`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                        처리할 행정 알림이 없습니다.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
