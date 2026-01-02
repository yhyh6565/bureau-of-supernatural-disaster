import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentSummary } from '@/components/dashboard/IncidentSummary';
import { MyAssignments } from '@/components/dashboard/MyAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { DisasterTicker } from '@/components/dashboard/DisasterTicker';
import { PersonalInfoWidget } from '@/components/dashboard/PersonalInfoWidget';
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

        {/* 메인 레이아웃 (3열: 주요일정 | 배정업무+재난현황 | 개인정보+행정알림) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 좌측: 주요 일정 (4) */}
          <div className="lg:col-span-3">
            <MiniWeeklySchedule />
          </div>

          {/* 중앙: 배정 업무 + 재난 현황 (5) */}
          <div className="lg:col-span-5 space-y-4">
            <MyAssignments />
            <IncidentSummary />
          </div>

          {/* 우측: 개인정보 + 행정알림 (4) */}
          <div className="lg:col-span-4 space-y-4">
            <PersonalInfoWidget />
            <AdminAlertWidget />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
