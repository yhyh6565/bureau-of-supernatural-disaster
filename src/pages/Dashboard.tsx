import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentSummary } from '@/components/dashboard/IncidentSummary';
import { MyAssignments } from '@/components/dashboard/MyAssignments';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';
import { DisasterTicker } from '@/components/dashboard/DisasterTicker';
import { PersonalInfoWidget } from '@/components/dashboard/PersonalInfoWidget';
import { AdminAlertWidget } from '@/components/dashboard/AdminAlertWidget';
import { MiniWeeklySchedule } from '@/components/dashboard/MiniWeeklySchedule';
import { WarningBanner } from '@/components/segwang/WarningBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SegwangTimelineLog } from '@/components/segwang/SegwangTimelineLog';

export function Dashboard() {
  const { agent } = useAuthStore();
  const { mode } = useBureauStore();
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (!agent) return null;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 pb-12">
        <h1 className="sr-only">대시보드</h1>

        {/* 세광 모드일 때만 경고 배너 표시 */}
        {mode === 'segwang' && <WarningBanner />}

        {/* 상단: 재난 경보 티커 */}
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <DisasterTicker />
        )}

        {/* 메인 레이아웃 (3열: 주요일정 | 배정업무+재난현황 | 개인정보+행정알림) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {isLoading ? (
            <>
              {/* 로딩 스켈레톤 */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-36" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-28" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              {/* 좌측: 주요 일정 (4) */}
              {/* Mobile: 1st, Tablet: 1st (Col 1-6), Desktop: 1st (Col 1-3) */}
              <div className="md:col-span-6 lg:col-span-3 order-1">
                {mode === 'segwang' ? <SegwangTimelineLog /> : <MiniWeeklySchedule />}
              </div>

              {/* 중앙: 배정 업무 + 재난 현황 (5) */}
              {/* Mobile: 2nd, Tablet: 3rd (Row 2, Full Width), Desktop: 2nd (Col 4-8) */}
              <div className="md:col-span-12 lg:col-span-5 space-y-4 order-2 md:order-3 lg:order-2">
                <IncidentSummary />
                <MyAssignments />
              </div>

              {/* 우측: 개인정보 + 행정알림 (4) */}
              {/* Mobile: 3rd, Tablet: 2nd (Col 7-12), Desktop: 3rd (Col 9-12) */}
              <div className="md:col-span-6 lg:col-span-4 space-y-4 order-3 md:order-2 lg:order-3">
                <PersonalInfoWidget />
                <AdminAlertWidget />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
