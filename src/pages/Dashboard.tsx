import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentList } from '@/components/dashboard/IncidentList';
import { MyAssignments } from '@/components/dashboard/MyAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { DisasterTicker } from '@/components/dashboard/DisasterTicker';
import { AgentStatusWidget } from '@/components/dashboard/AgentStatusWidget';
import { AdminAlertWidget } from '@/components/dashboard/AdminAlertWidget';
import { MiniWeeklySchedule } from '@/components/dashboard/MiniWeeklySchedule';

export function Dashboard() {
  const { agent } = useAuth();

  if (!agent) return null;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 pb-12">
        {/* 상단: 재난 경보 티커 */}
        <DisasterTicker />

        {/* 메인 레이아웃 (2:1 비율) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 좌측/중앙: 통합 작전 영역 (66%) */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. 배정 업무 (최우선) */}
            <MyAssignments />

            {/* 2. 전체 재난 현황 리스트 */}
            <IncidentList />
          </div>

          {/* 우측: 상태 및 행정 (33%) */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. 요원 상태 */}
            <AgentStatusWidget />

            {/* 2. 행정 알림 */}
            <AdminAlertWidget />

            {/* 3. 주간 일정 (간소화) */}
            <MiniWeeklySchedule />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
