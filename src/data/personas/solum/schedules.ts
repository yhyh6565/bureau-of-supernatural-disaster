import { Schedule } from '@/types/haetae';

export const SOLUM_SCHEDULES: Schedule[] = [
    { id: 'sch-010', title: '북촌 한옥 재조사', type: '작전', date: new Date('2026-01-03T15:00:00'), relatedId: 'inc-006' },
    { id: 'sch-011', title: '신입 요원 교육 참석', type: '훈련', date: new Date('2026-01-08T10:00:00') },
    { id: 'sch-012', title: '용천 선녀탕 방문', type: '방문예약', date: new Date('2026-01-10T15:00:00'), relatedId: 'loc-004' },
    { id: 'sch-013', title: '영은이랑 점심', type: '당직', date: new Date('2026-01-02T12:30:00') },
];
