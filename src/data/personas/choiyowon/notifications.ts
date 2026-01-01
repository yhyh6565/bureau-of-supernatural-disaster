import { Notification } from '@/types/haetae';

export const CHOIYOWON_NOTIFICATIONS: Notification[] = [
    {
        id: 'noti-104',
        title: '[현무1팀] 단독 출동 금지 안내',
        content: '최 요원의 잦은 단독 출동 사고로 인해, 향후 모든 출동은 2인 이상 팀 동반을 의무화합니다.',
        isUrgent: true,
        createdAt: new Date('2025-12-29T10:00:00'),
        isRead: false,
    },
    {
        id: 'noti-105',
        title: '오염도 관리 안내',
        content: '일주일에 한 번 정기 검진을 받고 계신 요원들께 감사드립니다. 지속적인 자가 관리 부탁드립니다.',
        isUrgent: false,
        createdAt: new Date('2025-12-20T09:00:00'),
        isRead: true,
    },
];
