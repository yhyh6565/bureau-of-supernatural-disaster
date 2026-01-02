import { ApprovalDocument, Agent } from '@/types/haetae';

// 결재 문서 생성 (ID 자동 생성)
export const createApprovalDocument = (
    data: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>,
    agent: Agent,
    approverName: string = '해금' // 기본값, 실제로는 agentId로 조회 필요
): ApprovalDocument => {
    return {
        id: `appr-${agent.personaKey || 'temp'}-${Date.now()}`,
        ...data,
        approverName,
        createdAt: new Date(),
        // status는 data에서 오거나 기본값 '결재대기'
    };
};

// 결재 유효성 검사 (예시)
export const validateApproval = (data: Partial<ApprovalDocument>): boolean => {
    return !!(data.title && data.content && data.approver);
};
