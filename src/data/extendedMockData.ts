import { Notification } from '@/types/haetae';

// 더미 쪽지 데이터
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
}

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    senderId: 'agent-002',
    senderName: '박현무',
    senderDepartment: '현무팀',
    receiverId: 'agent-001',
    title: '파주 현장 관련 협조 요청',
    content: '김솔음 주무관님, 파주 A구역 조사 건 관련하여 현장 진입 전 브리핑 부탁드립니다. 어둠의 종류가 시간의 틈이라고 들었는데, 주의사항 상세히 알려주시면 감사하겠습니다.',
    createdAt: new Date('2025-12-31T08:30:00'),
    isRead: false,
  },
  {
    id: 'msg-002',
    senderId: 'agent-003',
    senderName: '이주작',
    senderDepartment: '주작팀',
    receiverId: 'agent-001',
    title: '담양 현장 정리 완료 보고',
    content: '담양 죽녹원 현장 정리 완료했습니다. 메아리 안정화 확인되었고, 정기 순찰로 전환 예정입니다. 조사 보고서 참고 감사했습니다.',
    createdAt: new Date('2025-12-30T16:00:00'),
    isRead: true,
  },
  {
    id: 'msg-003',
    senderId: 'system',
    senderName: '시스템',
    senderDepartment: '관리자',
    receiverId: 'agent-001',
    title: '[자동알림] 결재 승인 완료',
    content: '귀하가 기안한 "20251229-001 조사보고서"가 최종 승인되었습니다.',
    createdAt: new Date('2025-12-29T14:30:00'),
    isRead: true,
  },
];

// 장비 데이터
export interface Equipment {
  id: string;
  name: string;
  category: '대여' | '지급';
  requiresApproval: boolean;
  description: string;
  totalStock: number;
  availableStock: number;
  imageEmoji: string;
}

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-001', name: '자전거', category: '대여', requiresApproval: false, description: '순찰용 일반 자전거', totalStock: 20, availableStock: 15, imageEmoji: '🚲' },
  { id: 'eq-002', name: '도깨비불', category: '대여', requiresApproval: true, description: '어둠 속 길 안내용 도깨비불. 취급 주의.', totalStock: 10, availableStock: 3, imageEmoji: '🔥' },
  { id: 'eq-003', name: '악의 저울', category: '대여', requiresApproval: true, description: '오염도 측정 장비. 정신 오염 위험.', totalStock: 5, availableStock: 2, imageEmoji: '⚖️' },
  { id: 'eq-004', name: '간이 유리감옥', category: '대여', requiresApproval: true, description: '소형 개체 임시 봉인용', totalStock: 8, availableStock: 4, imageEmoji: '🏺' },
  { id: 'eq-005', name: '해태상(소형)', category: '대여', requiresApproval: true, description: '결계 설치용 소형 해태상', totalStock: 12, availableStock: 7, imageEmoji: '🦁' },
  { id: 'eq-006', name: '유리 손포', category: '지급', requiresApproval: false, description: '일회용 보호 장갑. 오염 물질 취급용.', totalStock: 500, availableStock: 423, imageEmoji: '🧤' },
  { id: 'eq-007', name: '포승줄', category: '지급', requiresApproval: false, description: '봉인 문양이 새겨진 특수 포승줄', totalStock: 200, availableStock: 156, imageEmoji: '🪢' },
  { id: 'eq-008', name: '신발끈', category: '지급', requiresApproval: false, description: '결계 이탈 방지용 특수 신발끈', totalStock: 300, availableStock: 245, imageEmoji: '👟' },
  { id: 'eq-009', name: '시큼달큼', category: '지급', requiresApproval: false, description: '정신 오염 해독용 사탕', totalStock: 1000, availableStock: 876, imageEmoji: '🍬' },
  { id: 'eq-010', name: '메모리얼 그립톡', category: '지급', requiresApproval: false, description: '기억 고정용 휴대폰 액세서리', totalStock: 150, availableStock: 98, imageEmoji: '📱' },
];

// 방문 장소 데이터
export interface VisitLocation {
  id: string;
  name: string;
  description: string;
  requiresApproval: boolean;
  operatingHours: string;
  imageEmoji: string;
}

export const MOCK_LOCATIONS: VisitLocation[] = [
  { id: 'loc-001', name: '도깨비 공방', description: '특수 장비 제작 및 수리', requiresApproval: false, operatingHours: '09:00 - 18:00', imageEmoji: '🔧' },
  { id: 'loc-002', name: '바리데기 세공소', description: '봉인 장치 및 부적 제작', requiresApproval: false, operatingHours: '10:00 - 17:00', imageEmoji: '📿' },
  { id: 'loc-003', name: '이정 책방', description: '고문서 열람 및 연구', requiresApproval: false, operatingHours: '08:00 - 20:00', imageEmoji: '📚' },
  { id: 'loc-004', name: '용천 선녀탕', description: '정신 오염 정화 시설', requiresApproval: true, operatingHours: '06:00 - 22:00', imageEmoji: '♨️' },
];

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
  type: '조사보고서' | '출동일지' | '순찰일지' | '현장정리보고서' | '시말서' | '장비품의서' | '방문품의서';
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

export const MOCK_APPROVALS: ApprovalDocument[] = [
  {
    id: 'appr-001',
    type: '조사보고서',
    title: '20251230-003 파주 접경지역 조사보고서',
    content: '시간 왜곡 현상 확인. 멸형급 판정. 해태상 배치 권고.',
    status: '결재대기',
    createdBy: 'agent-001',
    createdByName: '김솔음',
    approver: 'agent-team-lead',
    approverName: '백호팀장',
    createdAt: new Date('2025-12-31T07:00:00'),
    relatedIncidentId: 'inc-002',
  },
  {
    id: 'appr-002',
    type: '출동일지',
    title: '20251229-001 해운대 구조 출동일지',
    content: '물의 기억 개체 안정화. 실종자 3명 구조 완료.',
    status: '승인',
    createdBy: 'agent-002',
    createdByName: '박현무',
    approver: 'agent-team-lead',
    approverName: '현무팀장',
    createdAt: new Date('2025-12-30T18:00:00'),
    processedAt: new Date('2025-12-31T09:00:00'),
    relatedIncidentId: 'inc-003',
  },
  {
    id: 'appr-003',
    type: '장비품의서',
    title: '도깨비불 대여 신청',
    content: '파주 현장 진입을 위한 도깨비불 2개 대여 요청',
    status: '결재대기',
    createdBy: 'agent-001',
    createdByName: '김솔음',
    approver: 'agent-team-lead',
    approverName: '백호팀장',
    createdAt: new Date('2025-12-31T06:00:00'),
  },
  {
    id: 'appr-004',
    type: '방문품의서',
    title: '용천 선녀탕 방문 신청',
    content: '정신 오염도 경미 - 정화 처리 요청',
    status: '반려',
    createdBy: 'agent-001',
    createdByName: '김솔음',
    approver: 'agent-team-lead',
    approverName: '백호팀장',
    createdAt: new Date('2025-12-28T10:00:00'),
    processedAt: new Date('2025-12-28T14:00:00'),
    rejectReason: '오염도 수치 미달. 일반 휴식으로 회복 가능.',
  },
];


// ==========================================
// 공통 데이터 (평범한 요원용)
// ==========================================

export const COMMON_NOTIFICATIONS: Notification[] = [
  {
    id: 'noti-005',
    title: '1월 구내식당 식단표',
    content: '첨부파일 참조 바랍니다. 맛있는 점심 되세요.',
    isUrgent: false,
    createdAt: new Date('2026-01-01T08:30:00'),
    isRead: false,
  },
  {
    id: 'noti-006',
    title: '[필독] 보안 점검 주간 안내',
    content: '다음 주 월요일부터 보안 점검이 실시됩니다. 책상 위 기밀 문서(3급 이상)는 반드시 파쇄하거나 금고에 보관해 주세요.',
    isUrgent: true,
    createdAt: new Date('2025-12-31T09:00:00'),
    isRead: false,
  },
  {
    id: 'noti-007',
    title: '사내 동호회 회원 모집 (탁구부)',
    content: '매주 수요일 저녁 지하 강당에서 탁구 치실 분 구합니다. 라켓 없어도 됨.',
    isUrgent: false,
    createdAt: new Date('2025-12-30T13:00:00'),
    isRead: true,
  },
  {
    id: 'noti-008',
    title: '[경고] 화장실 흡연 금지',
    content: '4층 남자 화장실에서 자꾸 전자담배 피우시는 분 적발 시 시말서 작성하게 하겠습니다. 매너 지켜주세요.',
    isUrgent: false,
    createdAt: new Date('2025-12-29T15:00:00'),
    isRead: true,
  },
  {
    id: 'noti-009',
    title: '[인사] 1월 승진 인사 발령 안내',
    content: '2026년 1월 1일자 승진 대상자 명단입니다. 축하드립니다.',
    isUrgent: false,
    createdAt: new Date('2025-12-31T18:00:00'),
    isRead: false,
  },
  {
    id: 'noti-010',
    title: '[현무팀] 차량 운행 일지 작성 철저',
    content: '최근 운행 일지 누락 건이 많습니다. 박현무 팀장님 지시사항이니 필히 작성 바랍니다.',
    isUrgent: true,
    department: 'hyunmu',
    createdAt: new Date('2025-12-28T10:00:00'),
    isRead: false,
  },
];

export const COMMON_MESSAGES: Message[] = [
  {
    id: 'msg-010',
    senderId: 'system',
    senderName: '시스템',
    senderDepartment: '의료국',
    receiverId: 'me',
    title: '오염도 정기 검사 안내',
    content: '금월 정기 오염도 검사 기한이 3일 남았습니다. 의료실 방문 바랍니다.',
    createdAt: new Date('2026-01-01T09:00:00'),
    isRead: false,
  },
  {
    id: 'msg-011',
    senderId: 'agent-006',
    senderName: '오수정',
    senderDepartment: '주작팀',
    receiverId: 'me',
    title: 'Re: 구내식당 메뉴 문의',
    content: '오늘 점심 돈까스래. 빨리 가자.',
    createdAt: new Date('2026-01-01T11:20:00'),
    isRead: false,
  },
  {
    id: 'msg-012',
    senderId: 'agent-001',
    senderName: '박홍림',
    senderDepartment: '현무팀',
    receiverId: 'me',
    title: '차량 배차 관련',
    content: '지난번 사고 때문에 당분간 운전 금지인거 알지? 이번 출동은 조수석에 타도록.',
    createdAt: new Date('2026-01-01T08:45:00'),
    isRead: true,
  },
  {
    id: 'msg-013',
    senderId: 'agent-005',
    senderName: '강철민',
    senderDepartment: '현무팀',
    receiverId: 'me',
    title: '장비 반납 확인 부탁드립니다',
    content: '어제 빌려가신 포승줄 반납 처리가 아직 안 된 것 같습니다. 확인 부탁드립니다!',
    createdAt: new Date('2025-12-31T17:50:00'),
    isRead: true,
  },
  {
    id: 'msg-014',
    senderId: 'agent-admin',
    senderName: '총무과',
    senderDepartment: '행정지원국',
    receiverId: 'me',
    title: '연말정산 안내',
    content: '안녕하세요 총무과입니다. 연말정산 서류 미비된 부분이 있어 연락드립니다.',
    createdAt: new Date('2025-12-28T14:00:00'),
    isRead: true,
  },
];

// 장례법 옵션
export const FUNERAL_OPTIONS = [
  { id: 'funeral-001', name: '화장', description: '일반적인 화장 절차' },
  { id: 'funeral-002', name: '매장', description: '일반적인 매장 절차' },
  { id: 'funeral-003', name: '수목장', description: '자연 친화적 수목장' },
  { id: 'funeral-004', name: '데이터 소각', description: '모든 개인 기록 영구 삭제' },
  { id: 'funeral-005', name: '기억 소거 후 방생', description: '관련자 기억 소거 후 신원 재설정' },
];
