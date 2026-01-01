import { Message } from '@/data/extendedMockData';

export const KOYOUNGEUN_MESSAGES: Message[] = [
    {
        id: 'msg-614',
        senderId: 'agent-006',
        senderName: '고영은',
        senderDepartment: '백호2팀',
        receiverId: 'agent-004',
        title: 'Re: 점심 같이?',
        content: '좋아요! 12시 30분에 식당 앞에서 만나요.',
        createdAt: new Date('2025-12-30T11:35:00'),
        isRead: true,
    },
    {
        id: 'msg-615',
        senderId: 'system',
        senderName: '시스템',
        senderDepartment: '자료관리국',
        receiverId: 'agent-006',
        title: '폐병원 조사 자료 전송',
        content: '대전 폐병원 사건 관련 과거 의료 기록을 전송합니다. 참고 바랍니다.',
        createdAt: new Date('2025-12-27T10:00:00'),
        isRead: true,
    },
    {
        id: 'msg-616',
        senderId: 'agent-006',
        senderName: '고영은',
        senderDepartment: '백호2팀',
        receiverId: 'agent-004',
        title: '조사 협조 요청',
        content: '솔음씨, 폐병원 조사 때 현무팀 지원이 필요할 것 같아요. 가능하신가요?',
        createdAt: new Date('2025-12-26T14:00:00'),
        isRead: true,
    },
];
