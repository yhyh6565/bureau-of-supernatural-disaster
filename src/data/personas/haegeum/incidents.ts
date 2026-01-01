import { Incident } from '@/types/haetae';

export const HAEGEUM_INCIDENTS: Incident[] = [
    {
        id: 'inc-008',
        caseNumber: '20251230-001',
        registrationNumber: '0008PSYA.2025.가08',
        location: '경기도 파주시 접경지역 A구역',
        dangerLevel: '멸형',
        status: '조사중',
        reportContent: '시간 왜곡 현상 발생. 군 통제선 설정. 현무3팀 해금 팀장 지휘.',
        requiresPatrol: false,
        countermeasure: '은심장 + 해태상 배치',
        entryRestrictions: '6급 이상만 진입 가능',
        createdAt: new Date('2025-12-30T18:00:00'),
        updatedAt: new Date('2025-12-31T09:00:00'),
    },
    {
        id: 'inc-009',
        caseNumber: '20251201-002',
        registrationNumber: '0009PSYA.2025.가09',
        location: '강원도 철원군 폐터널',
        dangerLevel: '파형',
        status: '정리대기',
        reportContent: '수십 년간 실종자 다수. 해금 팀장 봉인 작업 완료.',
        requiresPatrol: true,
        countermeasure: '특급 봉인',
        entryRestrictions: '월 1회 순찰 필수',
        createdAt: new Date('2025-12-01T06:00:00'),
        updatedAt: new Date('2025-12-15T18:00:00'),
    },
];
