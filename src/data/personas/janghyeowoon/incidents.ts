import { Incident } from '@/types/haetae';

export const JANGHYEOWOON_INCIDENTS: Incident[] = [
    {
        id: 'inc-701',
        caseNumber: '20251224-002',
        registrationNumber: '0012PSYA.2025.가12',
        location: '서울특별시 성북구 주택가',
        dangerLevel: '고형',
        status: '정리중',
        reportContent: '종결된 재난 현장 정리. 화각 요원 배정. 시신 처리 작업 진행.',
        requiresPatrol: false,
        countermeasure: '현장 소독 및 복구',
        createdAt: new Date('2025-12-24T14:00:00'),
        updatedAt: new Date('2025-12-25T18:00:00'),
    },
    {
        id: 'inc-702',
        caseNumber: '20251205-001',
        registrationNumber: '0013PSYA.2025.가13',
        location: '경기도 성남시 폐공장',
        dangerLevel: '뇌형',
        status: '정리대기',
        reportContent: '현무팀 종결 후 정리 대기. 화각 요원 출동 예정.',
        requiresPatrol: true,
        countermeasure: '공장 폐쇄 및 봉인',
        createdAt: new Date('2025-12-05T11:00:00'),
        updatedAt: new Date('2025-12-30T09:00:00'),
    },
];
