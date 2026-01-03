// 해태 시스템 타입 정의

export type Department = 'baekho' | 'hyunmu' | 'jujak';

export type AgentStatus = '정상' | '부상' | '오염' | '실종' | '사망' | '퇴사' | '휴직';

export type IncidentStatus = '접수' | '조사중' | '구조대기' | '구조중' | '정리대기' | '정리중' | '종결' | '봉인';

// 재난 등급 체계 (형刑 시스템)
export type DangerLevel = '멸형' | '파형' | '뇌형' | '고형' | '소형' | '등급불명';

export interface Agent {
  id: string;
  name: string;
  personaKey?: string; // 페르소나 고유 키 (메시지, 일정 등에서 사용)
  codename: string; // 작전명 (코드명)
  department: Department;
  team?: string; // 소속 팀 (예: "1팀", "3팀")
  rank: string;
  grade?: number; // 급수 (1~9)
  extension: string;
  status: AgentStatus;
  contamination: number; // 오염도 (0~100)
  totalIncidents: number; // 총 처리 재난 수
  specialCases: number; // 특수 케이스 수
  rentals: RentalRecord[]; // 현재 대여/지급 장비 목록
  purificationHistory: Date[]; // 용천 선녀탕 방문 기록
  funeralPreference?: string;
}

// 트리거 시스템 타입
export type TriggerType =
  | 'login'           // 로그인 시
  | 'time-elapsed'    // 시간 경과 (로그인 후)
  | 'date-range'      // 특정 날짜 범위
  | 'random'          // 랜덤 확률 (매번 체크)
  | 'condition';      // 기타 조건 키

export interface Trigger {
  type: TriggerType;
  delay?: number;              // 밀리초 (time-elapsed용)
  dateRange?: {
    start: string; // JSON 호환을 위해 string (ISO)
    end: string;
  };
  probability?: number;        // 0~1 사이 확률
  conditionKey?: string;       // 커스텀 조건 식별 키
}

export interface Incident {
  id: string;
  title: string;
  caseNumber: string; // UI표시용 사건 번호 (예: 1123)
  registrationNumber: string; // 0000PSYA.연도.가00 형식 (공식 등록번호)
  location: string;
  gpsCoordinates?: { lat: number; lng: number };
  dangerLevel: DangerLevel;
  status: IncidentStatus;
  reportContent: string;
  darknessType?: string; // 어둠 종류 (예: 그림자, 기생수 등)
  countermeasure?: string;
  entryRestrictions?: string;
  requiresPatrol: boolean;
  createdAt: Date;
  updatedAt: Date;
  manualId?: string;
  trigger?: Trigger; // [NEW] 트리거 조건
}

export interface ManualContent {
  identification: string;
  immediateAction: string[];
  taboo: string[];
}

export interface Manual {
  id: string;
  title: string;
  severity: DangerLevel;
  lastUpdated: Date;
  content: ManualContent;
  containmentMethod?: string;
  aftermath?: string;
  relatedIncidentIds?: string[];
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

// 공지사항 긴급도
export type NoticePriority = '긴급' | '필독' | '일반';

// 발신 부서
export type NoticeDepartment =
  | '백호반' | '현무반' | '주작반'
  | '본부' | '인사팀' | '보안팀' | '총무팀' | '전산팀' | '법무팀';

// 내용 분류
export type NoticeCategory =
  | '인사' | '보안' | '복지' | '안전' | '교육'
  | '행사' | '시스템' | '장비' | '규정' | '공지';

export interface Notification {
  id: string;
  title: string;
  content: string; // 요약 내용 (목록에 표시)
  fullContent: string; // 전체 본문 내용
  priority: NoticePriority; // 긴급도
  sourceDepartment: NoticeDepartment; // 발신 부서
  category: NoticeCategory; // 내용 분류
  author?: string; // 작성자
  isUrgent: boolean; // 하위 호환성 유지
  department?: Department; // 하위 호환성 유지
  createdAt: Date;
  isRead: boolean;
  isPinned?: boolean; // 상단 고정 여부
  trigger?: Trigger; // [NEW] 트리거 조건
}

// [REMOVED] Constants moved to src/constants/haetae.tsx

// 메세지/쪽지 데이터
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderDepartment: string;
  receiverId: string;
  title: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  trigger?: Trigger; // [NEW] 트리거 조건
}

// 장비 데이터
export interface Equipment {
  id: string;
  name: string;
  category: '대여' | '지급';
  requiresApproval: boolean;
  description: string;
  totalStock: number;
  availableStock: number;
  // imageEmoji removed
}

// 대여/지급 기록 데이터
export interface RentalRecord {
  id: string;
  equipmentName: string;
  category: '대여' | '지급';
  rentalDate: Date;
  dueDate?: Date;
  status: '정상' | '연체' | '반납완료';
  quantity: number;
}

// 방문 장소 데이터
export interface VisitLocation {
  id: string;
  name: string;
  description: string;
  requiresApproval: boolean;
  operatingHours: string;
  closedDates?: string[];  // 휴무일 (YYYY-MM-DD 형식)
  // imageEmoji removed
}

// 예약 슬롯 데이터
export interface ReservationSlot {
  id: string;
  locationId: string;
  date: Date;
  time: string;
  isAvailable: boolean;
  reservedBy?: string;
}

// 결재 문서 데이터
export interface ApprovalDocument {
  id: string;
  type: '조사보고서' | '출동일지' | '순찰일지' | '현장정리보고서' | '시말서' | '장비품의서' | '방문품의서' | '휴가신청서';
  title: string;
  content: string;
  status: '작성중' | '결재대기' | '승인' | '반려';
  createdBy: string;
  createdByName: string;
  approver: string;
  approverName: string;
  createdAt: Date;
  processedAt?: Date;
  relatedIncidentId?: string;
  rejectReason?: string;
}

// 오염 검사 요청 데이터
export interface InspectionRequest {
  id: string;
  agentId: string;
  type: '정기검사' | '정밀검사' | '긴급검사';
  status: '신청' | '접수' | '완료';
  scheduledDate: Date;
  symptoms?: string;
  result?: string;
  createdAt: Date;
}
