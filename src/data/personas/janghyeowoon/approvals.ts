import { ApprovalDocument } from '@/data/extendedMockData';

export const JANGHYEOWOON_APPROVALS: ApprovalDocument[] = [
    {
        id: 'appr-013',
        type: '현장정리보고서',
        title: '성북구 주택가 현장정리 보고',
        content: '성북구 주택가 재난 현장 정리를 완료했습니다. 시신 처리 및 현장 소독 완료. 민간인 목격 가능성 제거를 위해 기억 소거 작업도 병행했습니다.',
        status: '승인',
        createdBy: 'agent-007',
        createdByName: '장허운',
        approver: 'system',
        approverName: '주작2팀장',
        createdAt: new Date('2025-12-25T20:00:00'),
        relatedIncidentId: 'inc-012',
    },
    {
        id: 'appr-014',
        type: '시말서',
        title: '현장정리 중 컨디션 난조 사과',
        content: '성북구 현장정리 중 시신 처리 과정에서 일시적으로 컨디션 난조를 겪어 작업이 지연되었습니다. 죄송합니다. 향후 심리적 준비를 철저히 하겠습니다.',
        status: '승인',
        createdBy: 'agent-007',
        createdByName: '장허운',
        approver: 'system',
        approverName: '주작2팀장',
        createdAt: new Date('2025-12-25T21:00:00'),
        relatedIncidentId: 'inc-012',
    },
];
