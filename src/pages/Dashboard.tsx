import { MainLayout } from '@/components/layout/MainLayout';
import { WeeklySchedule } from '@/components/dashboard/WeeklySchedule';
import { IncidentList } from '@/components/dashboard/IncidentList';
import { DepartmentStats } from '@/components/dashboard/DepartmentStats';
import { NoticeWidget } from '@/components/dashboard/NoticeWidget';
import { MyAssignments } from '@/components/dashboard/MyAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENT_INFO } from '@/constants/haetae';

export function Dashboard() {
  const { agent } = useAuth();

  if (!agent) return null;

  const deptInfo = DEPARTMENT_INFO[agent.department];

  return (
    <MainLayout>
      {/* 페이지 타이틀 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold">대시보드</h1>
          <span className={`px-2 py-1 rounded text-xs font-medium bg-${deptInfo.colorClass}/10 text-${deptInfo.colorClass} flex items-center gap-1.5`}>
            <deptInfo.icon className="w-4 h-4" />
            <span>{deptInfo.name} ({deptInfo.fullName})</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {agent.name} {agent.rank}님, 환영합니다. 오늘도 안전한 하루 되세요.
        </p>
      </div>

      {/* 대시보드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-12">
        {/* 좌측: 일정 + 공지 */}
        <div className="space-y-4">
          <WeeklySchedule />
          <NoticeWidget />
        </div>

        {/* 중앙: 재난 현황 */}
        <div className="space-y-4">
          <IncidentList />
        </div>

        {/* 우측: 통계 + 배정 업무 */}
        <div className="space-y-4">
          <DepartmentStats />
          <MyAssignments />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
