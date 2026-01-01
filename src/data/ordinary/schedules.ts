import { Schedule } from '@/types/haetae';

export const ORDINARY_SCHEDULES: Schedule[] = [
    {
        id: 'sch-010',
        title: '신년 시무식',
        type: '행사', // Type definition might need update if '행사' not in ScheduleType
        date: new Date('2026-01-02T10:00:00'),
    } as any,
    {
        id: 'sch-011',
        title: '백호2팀 회식',
        type: '작전', // Fallback to existing type or need update
        date: new Date('2026-01-03T18:30:00'),
    },
    {
        id: 'sch-012',
        title: '정기 주간 당직',
        type: '당직',
        date: new Date('2026-01-05T18:00:00'),
    },
    {
        id: 'sch-013',
        title: '망원동 현장 재조사',
        type: '작전',
        date: new Date('2026-01-02T14:00:00'),
        relatedId: 'inc-003',
    },
    {
        id: 'sch-014',
        title: '개인정보보호 교육',
        type: '훈련',
        date: new Date('2026-01-04T15:00:00'),
    },
    {
        id: 'sch-015',
        title: '용천 선녀탕 예약',
        type: '방문예약',
        date: new Date('2026-01-06T19:00:00'),
        relatedId: 'loc-004',
    },
];
