// 해태 시스템 상수 정의

export const FUNERAL_OPTIONS = [
    { id: 'funeral-001', name: '화장', description: '일반적인 화장 절차' },
    { id: 'funeral-002', name: '매장', description: '일반적인 매장 절차' },
    { id: 'funeral-003', name: '수목장', description: '자연 친화적 수목장' },
    { id: 'funeral-004', name: '데이터 소각', description: '모든 개인 기록 영구 삭제' },
    { id: 'funeral-005', name: '기억 소거 후 방생', description: '관련자 기억 소거 후 신원 재설정' },
];

export const INSPECTION_TYPES = [
    { id: 'inspection-001', name: '정기검사', description: '매월 진행되는 정기 오염도 검사' },
    { id: 'inspection-002', name: '정밀검사', description: '오염도 30% 이상 시 권장되는 상세 검사' },
    { id: 'inspection-003', name: '긴급검사', description: '작전 직후 또는 이상 징후 발생 시 즉시 검사' },
];
import {
    Users,
    Shield,
    Gift,
    AlertTriangle,
    BookOpen,
    PartyPopper,
    Monitor,
    Wrench,
    ClipboardList,
    Megaphone
} from 'lucide-react';
import { BaekhoIcon, HyunmuIcon, JujakIcon } from '@/components/icons/DeptIcons';
import { Department, IncidentStatus, DangerLevel, NoticePriority, NoticeCategory, Agent } from '@/types/haetae';

// Import Profile JSONs
import PARKHONGLIM_PROFILE from '@/data/personas/parkhonglim/profile.json';
import CHOIYOWON_PROFILE from '@/data/personas/choiyowon/profile.json';
import RYUJAEGWAN_PROFILE from '@/data/personas/ryujaegwan/profile.json';
import SOLUM_PROFILE from '@/data/personas/solum/profile.json';
import HAEGEUM_PROFILE from '@/data/personas/haegeum/profile.json';
import KOYOUNGEUN_PROFILE from '@/data/personas/koyoungeun/profile.json';
import JANGHYEOWOON_PROFILE from '@/data/personas/janghyeowoon/profile.json';

// Helper to revive dates in Agent profile
const parseAgentProfile = (profile: any): Agent => {
    const agent = { ...profile };

    // Date fields conversion
    if (agent.purificationHistory) {
        agent.purificationHistory = agent.purificationHistory.map((d: string) => new Date(d));
    }

    if (agent.rentals) {
        agent.rentals = agent.rentals.map((r: any) => ({
            ...r,
            rentalDate: r.rentalDate ? new Date(r.rentalDate) : undefined,
            dueDate: r.dueDate ? new Date(r.dueDate) : undefined,
        }));
    }

    return agent as Agent;
};

export const AGENT_PROFILES: Record<string, Agent> = {
    'parkhonglim': parseAgentProfile(PARKHONGLIM_PROFILE),
    'choiyowon': parseAgentProfile(CHOIYOWON_PROFILE),
    'ryujaegwan': parseAgentProfile(RYUJAEGWAN_PROFILE),
    'solum': parseAgentProfile(SOLUM_PROFILE),
    'haegeum': parseAgentProfile(HAEGEUM_PROFILE),
    'koyoungeun': parseAgentProfile(KOYOUNGEUN_PROFILE),
    'janghyeowoon': parseAgentProfile(JANGHYEOWOON_PROFILE),
};

// 부서별 표시 정보
export const DEPARTMENT_INFO: Record<Department, {
    name: string;
    fullName: string;
    colorClass: string;
    bgClass: string;
    bgClassLight: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
    baekho: {
        name: '백호',
        fullName: '신규조사반',
        colorClass: 'baekho',
        bgClass: 'bg-baekho/20',
        bgClassLight: 'bg-baekho/10',
        textClass: 'text-baekho',
        icon: BaekhoIcon,
    },
    hyunmu: {
        name: '현무',
        fullName: '출동구조반',
        colorClass: 'hyunmu',
        bgClass: 'bg-hyunmu/20',
        bgClassLight: 'bg-hyunmu/10',
        textClass: 'text-hyunmu',
        icon: HyunmuIcon,
    },
    jujak: {
        name: '주작',
        fullName: '현장정리반',
        colorClass: 'jujak',
        bgClass: 'bg-jujak/20',
        bgClassLight: 'bg-jujak/10',
        textClass: 'text-jujak',
        icon: JujakIcon,
    },
};

// 위험 등급별 스타일 (형刑 시스템)
export const DANGER_LEVEL_STYLE: Record<DangerLevel, {
    bgClass: string;
    textClass: string;
    description: string;
}> = {
    '멸형': {
        bgClass: 'bg-abyssal',
        textClass: 'text-abyssal-foreground',
        description: '사망처리자 오십만 명 이상'
    },
    '파형': {
        bgClass: 'bg-destructive',
        textClass: 'text-destructive-foreground',
        description: '수십 년간 수백 명 실종, 종결 불가능'
    },
    '뇌형': {
        bgClass: 'bg-warning',
        textClass: 'text-warning-foreground',
        description: '수십 년간 수십 명 피해, 봉인 가능'
    },
    '고형': {
        bgClass: 'bg-muted',
        textClass: 'text-muted-foreground',
        description: '인명피해 없음'
    },
    '소형': {
        bgClass: 'bg-slate-200',
        textClass: 'text-slate-700',
        description: '재산 피해 경미'
    },
    '등급불명': {
        bgClass: 'bg-indigo-500',
        textClass: 'text-white',
        description: '측정 불가'
    },
};

// 오염도 레벨별 스타일
export const CONTAMINATION_STYLE = {
    normal: { range: [0, 30], color: 'bg-green-500', text: '정상' },
    caution: { range: [31, 69], color: 'bg-yellow-500', text: '주의' },
    warning: { range: [70, 89], color: 'bg-orange-500', text: '위험' },
    critical: { range: [90, 100], color: 'bg-red-500', text: '심각' },
} as const;

// 상태별 스타일
export const STATUS_STYLE: Record<IncidentStatus, { bgClass: string; textClass: string; borderClass?: string }> = {
    '접수': { bgClass: 'bg-baekho', textClass: 'text-baekho-foreground' },
    '조사중': { bgClass: 'bg-baekho/80', textClass: 'text-baekho-foreground' },
    '구조대기': { bgClass: 'bg-hyunmu', textClass: 'text-hyunmu-foreground' },
    '구조중': { bgClass: 'bg-hyunmu/80', textClass: 'text-hyunmu-foreground' },
    '정리대기': { bgClass: 'bg-jujak', textClass: 'text-jujak-foreground' },
    '정리중': { bgClass: 'bg-jujak/80', textClass: 'text-jujak-foreground' },
    '종결': { bgClass: 'bg-success', textClass: 'text-success-foreground' },
    '봉인': { bgClass: 'bg-abyssal', textClass: 'text-abyssal-foreground' },
    '격리중': { bgClass: 'bg-destructive/10', textClass: 'text-destructive', borderClass: 'border-destructive' },
    '관찰중': { bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', borderClass: 'border-yellow-500' },
};

// 근무 상태 한글 매핑
export const STATUS_MAP: Record<string, string> = {
    'active': '정상',
    'resigned': '퇴사',
    'missing': '실종',
    'injured': '부상',
    'contaminated': '오염',
    'deceased': '사망',
    'leave': '휴직',
};

// 공지사항 긴급도별 스타일
export const NOTICE_PRIORITY_STYLE: Record<NoticePriority, {
    bgClass: string;
    textClass: string;
    borderClass: string;
}> = {
    '긴급': {
        bgClass: 'bg-destructive',
        textClass: 'text-destructive-foreground',
        borderClass: 'border-destructive',
    },
    '필독': {
        bgClass: 'bg-warning',
        textClass: 'text-warning-foreground',
        borderClass: 'border-warning',
    },
    '일반': {
        bgClass: 'bg-muted',
        textClass: 'text-muted-foreground',
        borderClass: 'border-muted',
    },
};

// 공지사항 카테고리별 스타일
export const NOTICE_CATEGORY_STYLE: Record<NoticeCategory, {
    bgClass: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
    '인사': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Users },
    '보안': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Shield },
    '복지': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Gift },
    '안전': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: AlertTriangle },
    '교육': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: BookOpen },
    '행사': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: PartyPopper },
    '시스템': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Monitor },
    '장비': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Wrench },
    '규정': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: ClipboardList },
    '공지': { bgClass: 'bg-slate-100', textClass: 'text-slate-600', icon: Megaphone },
};

// 페르소나 키를 이름으로 매핑
export const PERSONA_NAMES: Record<string, string> = {
    'parkhonglim': '박홍림',
    'choiyowon': '최요원',
    'ryujaegwan': '류재관',
    'solum': '김솔음',
    'haegeum': '해금',
    'koyoungeun': '고영은',
    'janghyeowoon': '장허운',
};

// 페르소나 키를 이름으로 변환하는 유틸리티 함수
export const getPersonaName = (personaKey: string | undefined): string => {
    if (!personaKey) return '';
    return PERSONA_NAMES[personaKey] || personaKey;
};

// 랜덤 요원명 생성용 단어 목록
export const RANDOM_CODENAMES = ['유리', '살구', '새솔', '자라'];
