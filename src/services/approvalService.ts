import { ApprovalDocument, Agent } from '@/types/haetae';
import { DEPARTMENT_INFO } from '@/constants/haetae';

// 페르소나별/팀별 결재자 결정 로직
// 페르소나별/팀별 결재자 결정 로직
const determineApproverInfo = (agent: Agent): { id: string; name: string } => {
    const key = agent.personaKey;

    // 1. 특정 네임드 캐릭터 (고정 결재선 - 특수 규칙)
    // 이들은 소속 팀 규칙보다 우선하여 특정 결재자에게 상신함
    if (key === 'haegeum' || key === 'choiyowon' || key === 'solum' || key === 'ryujaegwan') {
        return { id: 'head_hyunmu', name: '출동구조반 부서장' };
    }
    if (key === 'koyoungeun') {
        return { id: 'team_baekho_2', name: '신규조사반 2팀 팀장' };
    }
    if (key === 'janghyeowoon') {
        return { id: 'team_jujak_2', name: '현장정리반 2팀 팀장' };
    }

    // 2. 일반 페르소나 및 동적 생성 요원
    // agent.team 정보가 있으면 우선 사용, 없으면 ID 해시 기반으로 추정
    let teamNum = 1;
    if (agent.team) {
        // "1팀", "3팀" 등에서 숫자만 추출
        const match = agent.team.match(/\d+/);
        if (match) {
            teamNum = parseInt(match[0], 10);
        }
    } else {
        // fallback (기존 로직)
        const idSum = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        teamNum = (idSum % 5) + 1;
    }

    const deptName = DEPARTMENT_INFO[agent.department]?.fullName || '부서';

    // 출동구조반(현무) 특수 규칙
    if (agent.department === 'hyunmu') {
        if (teamNum === 1) {
            return { id: 'head_hyunmu', name: '출동구조반 부서장' };
        }
        if (teamNum === 3) {
            return { id: 'haegeum', name: '해금' };
        }
    } else {
        // 타 부서 1팀도 부서장으로 처리
        if (teamNum === 1) {
            return { id: `head_${agent.department}`, name: `${deptName} 부서장` };
        }
    }

    // 기본: 해당 팀 팀장
    return { id: `team_${agent.department}_${teamNum}`, name: `${deptName} ${teamNum}팀 팀장` };
};


// 결재 문서 생성 (ID 자동 생성)
export const createApprovalDocument = (
    data: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>,
    agent: Agent,
    approverNameOverride?: string
): ApprovalDocument => {
    const approverInfo = determineApproverInfo(agent);

    return {
        id: `appr-${agent.personaKey || 'temp'}-${Date.now()}`,
        ...data,
        approver: data.approver || approverInfo.id, // data에 없으면 자동 배정
        approverName: approverNameOverride || approverInfo.name,
        createdAt: new Date(),
        // status는 data에서 오거나 기본값 '결재대기'
    };
};

// 결재 유효성 검사 (예시)
export const validateApproval = (data: Partial<ApprovalDocument>): boolean => {
    return !!(data.title && data.content && data.approver);
};
