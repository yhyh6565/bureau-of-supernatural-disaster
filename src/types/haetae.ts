// 해태 시스템 타입 정의

export type Department = 'baekho' | 'hyunmu' | 'jujak';

export type AgentStatus = '정상' | '부상' | '오염' | '실종' | '사망';

export type IncidentStatus = '접수' | '조사중' | '구조대기' | '구조중' | '정리대기' | '정리중' | '종결';

// 재난 등급 체계 (형刑 시스템)
export type DangerLevel = '멸형' | '파형' | '뇌형' | '고형';

export interface Agent {
  id: string;
  name: string;
  codename: string; // 작전명 (코드명)
  department: Department;
  rank: string;
  grade?: number; // 급수 (1~9)
  extension: string;
  status: AgentStatus;
  contamination: number; // 오염도 (0~100)
  totalIncidents: number; // 총 처리 재난 수
  specialCases: number; // 특수 케이스 수
  equipmentInUse: string[]; // 현재 대여 중인 장비
  purificationHistory: Date[]; // 용천 선녀탕 방문 기록
  funeralPreference?: string;
}

export interface Incident {
  id: string;
  caseNumber: string; // YYYYMMDD-001 형식 (내부 사용)
  registrationNumber: string; // 0000PSYA.연도.가00 형식 (공식 등록번호)
  location: string;
  gpsCoordinates?: { lat: number; lng: number };
  dangerLevel: DangerLevel;
  status: IncidentStatus;
  reportContent: string;
  darknessType?: string;
  countermeasure?: string;
  entryRestrictions?: string;
  requiresPatrol: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  type: '조사' | '구조(긴급)' | '구조(순찰)' | '현장정리';
  agentId: string;
  incidentId: string;
  assignedAt: Date;
  completedAt?: Date;
}

export interface Schedule {
  id: string;
  title: string;
  type: '작전' | '방문예약' | '결재마감' | '당직' | '훈련' | '행사';
  date: Date;
  relatedId?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  department?: Department;
  createdAt: Date;
  isRead: boolean;
}

// 부서별 표시 정보
export const DEPARTMENT_INFO: Record<Department, {
  name: string;
  fullName: string;
  colorClass: string;
  icon: string;
}> = {
  baekho: {
    name: '백호',
    fullName: '신규조사반',
    colorClass: 'baekho',
    icon: '🐯',
  },
  hyunmu: {
    name: '현무',
    fullName: '출동구조반',
    colorClass: 'hyunmu',
    icon: '🐢',
  },
  jujak: {
    name: '주작',
    fullName: '현장정리반',
    colorClass: 'jujak',
    icon: '🐦',
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
};

// 오염도 레벨별 스타일
export const CONTAMINATION_STYLE = {
  normal: { range: [0, 30], color: 'bg-green-500', text: '정상' },
  caution: { range: [31, 69], color: 'bg-yellow-500', text: '주의' },
  warning: { range: [70, 89], color: 'bg-orange-500', text: '위험' },
  critical: { range: [90, 100], color: 'bg-red-500', text: '심각' },
} as const;

// 상태별 스타일
export const STATUS_STYLE: Record<IncidentStatus, {
  bgClass: string;
  textClass: string;
}> = {
  '접수': { bgClass: 'bg-baekho', textClass: 'text-baekho-foreground' },
  '조사중': { bgClass: 'bg-baekho/80', textClass: 'text-baekho-foreground' },
  '구조대기': { bgClass: 'bg-hyunmu', textClass: 'text-hyunmu-foreground' },
  '구조중': { bgClass: 'bg-hyunmu/80', textClass: 'text-hyunmu-foreground' },
  '정리대기': { bgClass: 'bg-jujak', textClass: 'text-jujak-foreground' },
  '정리중': { bgClass: 'bg-jujak/80', textClass: 'text-jujak-foreground' },
  '종결': { bgClass: 'bg-success', textClass: 'text-success-foreground' },
};
