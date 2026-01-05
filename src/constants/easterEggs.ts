import { Message } from '@/types/haetae';

export interface EasterEggConfig {
    id: string;
    triggerType: 'time-elapsed' | 'login' | 'action';
    delaySeconds?: number;
    targetCondition: 'ordinary' | 'all' | 'specific';
    message?: Partial<Message> & { displayDate?: string };
    toast?: {
        description: string;
        variant?: "default" | "destructive";
        className?: string;
    };
}

export const EASTER_EGGS: EasterEggConfig[] = [
    {
        id: "msg-haunted-001",
        triggerType: "time-elapsed",
        delaySeconds: 60,
        targetCondition: "ordinary",
        message: {
            id: 'msg-haunted-001',
            senderId: 'unknown',
            senderName: '■■■',
            senderDepartment: '현장탐사반',
            title: '오지마',
            content: '지사로 오지마 여기 지금 분위기 이상해 오ㅈㅣㅁㅏㅏㅏㅏ ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏ',
            createdAt: new Date('1900-05-04T00:00:00'),
            displayDate: "20■■.05.04",
            isRead: false
        },
        toast: {
            description: "■■■ 쪽지가 도착했습니다",
            variant: "destructive",
            className: "bg-black text-white border-red-900"
        }
    }
];
