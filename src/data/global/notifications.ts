import { Notification } from '@/types/haetae';

export const GLOBAL_NOTIFICATIONS: Notification[] = [
    {
        id: 'noti-005',
        title: '1월 구내식당 식단표',
        content: '첨부파일 참조 바랍니다. 맛있는 점심 되세요.',
        isUrgent: false,
        createdAt: new Date('2026-01-01T08:30:00'),
        isRead: false,
    },
    {
        id: 'noti-006',
        title: '[필독] 보안 점검 주간 안내',
        content: '다음 주 월요일부터 보안 점검이 실시됩니다. 책상 위 기밀 문서(3급 이상)는 반드시 파쇄하거나 금고에 보관해 주세요.',
        isUrgent: true,
        createdAt: new Date('2025-12-31T09:00:00'),
        isRead: false,
    },
    {
        id: 'noti-007',
        title: '사내 동호회 회원 모집 (탁구부)',
        content: '매주 수요일 저녁 지하 강당에서 탁구 치실 분 구합니다. 라켓 없어도 됨.',
        isUrgent: false,
        createdAt: new Date('2025-12-30T13:00:00'),
        isRead: true,
    },
    {
        id: 'noti-008',
        title: '[경고] 화장실 흡연 금지',
        content: '4층 남자 화장실에서 자꾸 전자담배 피우시는 분 적발 시 시말서 작성하게 하겠습니다. 매너 지켜주세요.',
        isUrgent: false,
        createdAt: new Date('2025-12-29T15:00:00'),
        isRead: true,
    },
    {
        id: 'noti-009',
        title: '[인사] 1월 승진 인사 발령 안내',
        content: '2026년 1월 1일자 승진 대상자 명단입니다. 축하드립니다.',
        isUrgent: false,
        createdAt: new Date('2025-12-31T18:00:00'),
        isRead: false,
    },
    {
        id: 'noti-010',
        title: '[현무팀] 차량 운행 일지 작성 철저',
        content: '최근 운행 일지 누락 건이 많습니다. 박현무 팀장님 지시사항이니 필히 작성 바랍니다.',
        isUrgent: true,
        department: 'hyunmu',
        createdAt: new Date('2025-12-28T10:00:00'),
        isRead: false,
    },
];
