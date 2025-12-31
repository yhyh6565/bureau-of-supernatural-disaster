import { Incident, Schedule, Notification, DangerLevel, IncidentStatus } from '@/types/haetae';

// 더미 재난 데이터
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    caseNumber: '20251231-001',
    location: '서울특별시 종로구 청운동 폐가',
    dangerLevel: '위험',
    status: '접수',
    reportContent: '야간 산책 중 폐가에서 인간이 아닌 것으로 추정되는 그림자 목격. 목격자 정신 오염 의심.',
    requiresPatrol: false,
    createdAt: new Date('2025-12-31T02:30:00'),
    updatedAt: new Date('2025-12-31T02:30:00'),
  },
  {
    id: 'inc-002',
    caseNumber: '20251230-003',
    location: '경기도 파주시 접경지역 A구역',
    dangerLevel: '멸형',
    status: '조사중',
    reportContent: '시간 왜곡 현상 발생. 해당 구역 진입자 실종. 군 통제선 설정됨.',
    darknessType: '시간의 틈',
    countermeasure: '해태상 배치 필요',
    entryRestrictions: '단독 진입 금지, 해태상 미보유자 진입 금지',
    requiresPatrol: false,
    createdAt: new Date('2025-12-30T18:00:00'),
    updatedAt: new Date('2025-12-31T09:00:00'),
  },
  {
    id: 'inc-003',
    caseNumber: '20251229-001',
    location: '부산광역시 해운대구 해변로',
    dangerLevel: '주의',
    status: '구조중',
    reportContent: '해변에서 원인 불명의 안개 발생. 안개 내 실종자 3명.',
    darknessType: '물의 기억',
    countermeasure: '소금 결계 설치',
    requiresPatrol: false,
    createdAt: new Date('2025-12-29T14:00:00'),
    updatedAt: new Date('2025-12-31T08:00:00'),
  },
  {
    id: 'inc-004',
    caseNumber: '20251215-002',
    location: '전라남도 담양군 죽녹원',
    dangerLevel: '일반',
    status: '정리대기',
    reportContent: '대나무 숲에서 정체불명의 소리 반복 발생. 구조 완료.',
    darknessType: '메아리',
    requiresPatrol: true,
    createdAt: new Date('2025-12-15T10:00:00'),
    updatedAt: new Date('2025-12-31T07:00:00'),
  },
  {
    id: 'inc-005',
    caseNumber: '20251220-001',
    location: '강원도 평창군 대관령',
    dangerLevel: '일반',
    status: '종결',
    reportContent: '눈보라 속 방황하는 영혼 목격. 안정화 완료.',
    darknessType: '길 잃은 자',
    requiresPatrol: true,
    createdAt: new Date('2025-12-20T06:00:00'),
    updatedAt: new Date('2025-12-28T16:00:00'),
  },
];

// 더미 일정 데이터
export const MOCK_SCHEDULES: Schedule[] = [
  { id: 'sch-001', title: '정기 안전 교육', type: '훈련', date: new Date('2025-12-31T10:00:00') },
  { id: 'sch-002', title: '도깨비 공방 방문', type: '방문예약', date: new Date('2025-12-31T14:00:00') },
  { id: 'sch-003', title: '월간 보고서 제출', type: '결재마감', date: new Date('2025-12-31T18:00:00') },
  { id: 'sch-004', title: '야간 당직', type: '당직', date: new Date('2025-12-31T22:00:00') },
  { id: 'sch-005', title: '담양 정기 순찰', type: '작전', date: new Date('2026-01-01T09:00:00') },
  { id: 'sch-006', title: '해태상 점검', type: '작전', date: new Date('2026-01-02T11:00:00') },
  { id: 'sch-007', title: '신입 요원 교육', type: '훈련', date: new Date('2026-01-03T10:00:00') },
];

// 더미 공지사항
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'noti-001',
    title: '[긴급] 파주 A구역 접근 금지 안내',
    content: '파주시 접경지역 A구역에서 멸형급 재난이 발생했습니다. 해당 구역 100m 이내 접근을 금지합니다.',
    isUrgent: true,
    createdAt: new Date('2025-12-30T19:00:00'),
    isRead: false,
  },
  {
    id: 'noti-002',
    title: '12월 식단표 안내',
    content: '12월 구내식당 식단표입니다. 금일 점심: 김치찌개, 동치미, 계란말이',
    isUrgent: false,
    createdAt: new Date('2025-12-01T09:00:00'),
    isRead: true,
  },
  {
    id: 'noti-003',
    title: '[보안] 페르소나 키 관리 수칙',
    content: '페르소나 키(이름)는 절대 외부에 노출되어서는 안 됩니다. 위반 시 징계 조치됩니다.',
    isUrgent: true,
    createdAt: new Date('2025-12-15T11:00:00'),
    isRead: true,
  },
  {
    id: 'noti-004',
    title: '연말 정산 서류 제출 안내',
    content: '2025년 연말 정산 서류를 1월 15일까지 인사팀에 제출해주시기 바랍니다.',
    isUrgent: false,
    createdAt: new Date('2025-12-20T10:00:00'),
    isRead: false,
  },
];

// 통계 데이터
export const MOCK_STATS = {
  baekho: {
    received: 12,
    investigating: 3,
    completed: 9,
  },
  hyunmu: {
    requests: 28,
    rescuing: 2,
    completed: 26,
  },
  jujak: {
    requests: 15,
    cleaning: 1,
    completed: 14,
  },
};
