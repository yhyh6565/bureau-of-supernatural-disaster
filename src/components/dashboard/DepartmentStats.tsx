import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/constants/haetae';
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: 'default' | 'active' | 'complete';
}

function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    active: 'bg-warning/10 text-warning',
    complete: 'bg-success/10 text-success',
  };

  return (
    <div className={`p-4 rounded-sm ${variants[variant]} flex items-center gap-3`}>
      <Icon className="w-8 h-8" />
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-xs">{label}</div>
      </div>
    </div>
  );
}

export function DepartmentStats() {
  const { agent } = useAuth();

  if (!agent) return null;

  const department = agent.department;
  const deptInfo = DEPARTMENT_INFO[department];
  const allStats = DataManager.getStats();

  const renderStats = () => {
    switch (department) {
      case 'baekho': {
        const stats = allStats.baekho;
        return (
          <>
            <StatCard
              label="접수 건수 (이번 달)"
              value={stats.received}
              icon={AlertCircle}
              variant="default"
            />
            <StatCard
              label="조사 중"
              value={stats.investigating}
              icon={Clock}
              variant="active"
            />
            <StatCard
              label="조사 완료"
              value={stats.completed}
              icon={CheckCircle2}
              variant="complete"
            />
          </>
        );
      }
      case 'hyunmu': {
        const stats = allStats.hyunmu;
        return (
          <>
            <StatCard
              label="구조 요청 (이번 달)"
              value={stats.requests}
              icon={AlertCircle}
              variant="default"
            />
            <StatCard
              label="구조 중"
              value={stats.rescuing}
              icon={Clock}
              variant="active"
            />
            <StatCard
              label="구조 완료"
              value={stats.completed}
              icon={CheckCircle2}
              variant="complete"
            />
          </>
        );
      }
      case 'jujak': {
        const stats = allStats.jujak;
        return (
          <>
            <StatCard
              label="정리 요청 (이번 달)"
              value={stats.requests}
              icon={AlertCircle}
              variant="default"
            />
            <StatCard
              label="정리 중"
              value={stats.cleaning}
              icon={Clock}
              variant="active"
            />
            <StatCard
              label="정리 완료"
              value={stats.completed}
              icon={CheckCircle2}
              variant="complete"
            />
          </>
        );
      }
    }
  };

  return (
    <Card className="card-gov">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {deptInfo.name} ({deptInfo.fullName}) 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderStats()}
        </div>
      </CardContent>
    </Card>
  );
}
