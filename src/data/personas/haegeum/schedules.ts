import { Schedule } from '@/types/haetae';

export const HAEGEUM_SCHEDULES: Schedule[] = [
    { id: 'sch-014', title: '파주 A구역 2차 조사', type: '작전', date: new Date('2026-01-02T09:00:00'), relatedId: 'inc-008' },
    { id: 'sch-015', title: '철원 폐터널 월간 순찰', type: '작전', date: new Date('2026-01-15T11:00:00'), relatedId: 'inc-009' },
    { id: 'sch-016', title: '현무3팀 월례 회의', type: '훈련', date: new Date('2026-01-05T14:00:00') },
];
