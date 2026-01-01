import { Schedule } from '@/types/haetae';

export const CHOIYOWON_SCHEDULES: Schedule[] = [
    { id: 'sch-001', title: '정기 오염도 검진', type: '훈련', date: new Date('2026-01-02T09:00:00') },
    { id: 'sch-002', title: '정기 오염도 검진', type: '훈련', date: new Date('2026-01-09T09:00:00') },
    { id: 'sch-003', title: '정기 오염도 검진', type: '훈련', date: new Date('2026-01-16T09:00:00') },
    { id: 'sch-004', title: '강남 폐건물 재조사', type: '작전', date: new Date('2026-01-03T14:00:00'), relatedId: 'inc-001' },
    { id: 'sch-005', title: '일산 호수공원 순찰', type: '작전', date: new Date('2026-01-05T20:00:00'), relatedId: 'inc-003' },
];
