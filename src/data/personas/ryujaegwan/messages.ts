import { Message } from '@/data/extendedMockData';

export const RYUJAEGWAN_MESSAGES: Message[] = [
    {
        id: 'msg-005',
        senderId: 'agent-003',
        senderName: '류재관',
        senderDepartment: '현무1팀',
        receiverId: 'agent-002',
        title: 'Re: 강남 사건 지원 요청',
        content: '알겠습니다. 내일 오전 현장 방문하겠습니다. 사진 먼저 보내주세요.',
        createdAt: new Date('2025-12-28T16:00:00'),
        isRead: true,
    },
    {
        id: 'msg-006',
        senderId: 'system',
        senderName: '시스템',
        senderDepartment: '장비관리반',
        receiverId: 'agent-003',
        title: '부적 재료 입고 안내',
        content: '귀하가 신청한 황지(黃紙) 100매가 장비관리반에 입고되었습니다.',
        createdAt: new Date('2025-12-20T14:00:00'),
        isRead: true,
    },
    {
        id: 'msg-007',
        senderId: 'agent-001',
        senderName: '박홍림',
        senderDepartment: '현무1팀',
        receiverId: 'agent-003',
        title: '전주 한옥마을 보고서 승인',
        content: '전주 사건 처리 보고서 검토했습니다. 체계적으로 잘 정리되었습니다. 승인합니다.',
        createdAt: new Date('2025-12-27T10:00:00'),
        isRead: true,
    },
];
