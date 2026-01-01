import { Message } from '@/data/extendedMockData';

export const HAEGEUM_MESSAGES: Message[] = [
    {
        id: 'msg-512',
        senderId: 'system',
        senderName: '시스템',
        senderDepartment: '긴급재난국',
        receiverId: 'agent-005',
        title: '멸형급 재난 발생 긴급 소집',
        content: '파주 A구역 멸형급 재난 발생. 현무3팀 긴급 소집. 즉시 출동 준비 바랍니다.',
        createdAt: new Date('2025-12-30T18:05:00'),
        isRead: true,
    },
    {
        id: 'msg-513',
        senderId: 'agent-005',
        senderName: '해금',
        senderDepartment: '현무3팀',
        receiverId: 'agent-001',
        title: '파주 사건 보고',
        content: '홍림 팀장님, 파주 A구역 1차 조사 완료했습니다. 은심장으로 민간인 대피 완료. 상세 보고서는 내일 제출하겠습니다.',
        createdAt: new Date('2025-12-30T22:00:00'),
        isRead: true,
    },
];
