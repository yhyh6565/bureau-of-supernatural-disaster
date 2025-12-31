// 해태 시스템 타입 정의

export type Department = 'baekho' | 'hyunmu' | 'jujak';

export type AgentStatus = '정상' | '부상' | '오염' | '실종' | '사망';

export type IncidentStatus = '접수' | '조사중' | '구조대기' | '구조중' | '정리대기' | '정리중' | '종결';

export type DangerLevel = '일반' | '주의' | '위험' | '멸형';

export interface Agent {
  id: string;
  name: string;
  department: Department;
  rank: string;
  extension: string;
  status: AgentStatus;
  funeralPreference?: string;
}

export interface Incident {
  id: string;
  caseNumber: string; // YYYYMMDD-001 형식
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
  type: '작전' | '방문예약' | '결재마감' | '당직' | '훈련';
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

// 위험 등급별 스타일
export const DANGER_LEVEL_STYLE: Record<DangerLevel, {
  bgClass: string;
  textClass: string;
}> = {
  '일반': { bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
  '주의': { bgClass: 'bg-warning', textClass: 'text-warning-foreground' },
  '위험': { bgClass: 'bg-destructive', textClass: 'text-destructive-foreground' },
  '멸형': { bgClass: 'bg-abyssal', textClass: 'text-abyssal-foreground' },
};

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
