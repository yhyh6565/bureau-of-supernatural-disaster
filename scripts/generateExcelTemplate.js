import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create workbook
const wb = XLSX.utils.book_new();

// 1. AGENTS SHEET
const agentsData = [
  ['id', 'name', 'codename', 'department', 'team', 'rank', 'grade', 'extension', 'status', 'contamination', 'totalIncidents', 'specialCases', 'equipmentInUse', 'purificationHistory', 'funeralPreference'],
  // 현무팀 (from research)
  ['agent-001', '박홍림', 'HMU-001', '출동구조반', '현무1팀', '팀장', 6, '3401', '정상', 12, 45, 8, '[]', '[2025-11-20;2025-10-15;2025-09-10]', '화장'],
  ['agent-002', '최요원', 'HMU-002', '출동구조반', '현무1팀', '주무관', 7, '3402', '정상', 18, 32, 5, '[eq-002]', '[2025-12-01;2025-11-05]', '매장'],
  ['agent-003', '류재관', 'HMU-003', '출동구조반', '현무1팀', '실무관', 9, '3403', '정상', 25, 38, 7, '[]', '[2025-11-28;2025-10-30]', '수목장'],
  ['agent-004', '해금', 'HMU-010', '출동구조반', '현무3팀', '팀장', 6, '3410', '정상', 8, 52, 11, '[eq-008]', '[2025-12-10;2025-11-18;2025-10-25]', '화장'],
  // 백호팀 (examples to fill)
  ['agent-005', '', 'BKH-001', '신규조사반', '백호1팀', '주무관', 7, '3301', '정상', 0, 0, 0, '[]', '[]', ''],
  ['agent-006', '', 'BKH-002', '신규조사반', '백호1팀', '실무관', 9, '3302', '정상', 0, 0, 0, '[]', '[]', ''],
  // 주작팀 (examples to fill)
  ['agent-007', '', 'JJK-001', '현장정리반', '주작1팀', '주무관', 7, '3501', '정상', 0, 0, 0, '[]', '[]', ''],
  ['agent-008', '', 'JJK-002', '현장정리반', '주작1팀', '실무관', 9, '3502', '정상', 0, 0, 0, '[]', '[]', ''],
];
const wsAgents = XLSX.utils.aoa_to_sheet(agentsData);
XLSX.utils.book_append_sheet(wb, wsAgents, 'agents');

// 2. INCIDENTS SHEET
const incidentsData = [
  ['id', 'caseNumber', 'registrationNumber', 'location', 'dangerLevel', 'status', 'reportContent', 'requiresPatrol', 'gpsCoordinates', 'countermeasure', 'entryRestrictions', 'createdAt', 'updatedAt'],
  // 멸형급 (from research - 파주 사건)
  ['inc-001', '20251230-001', '0001PSYA.2025.가01', '경기도 파주시 접경지역 A구역', '멸형', '조사중', '시간 왜곡 현상 발생. 해당 구역 진입자 실종. 군 통제선 설정됨.', 'false', '', '해태상 배치 필요', '단독 진입 금지, 해태상 미보유자 진입 금지', '2025-12-30T18:00:00', '2025-12-31T09:00:00'],
  // 파형급 (example to fill)
  ['inc-002', '20251215-002', '0002PSYA.2025.가02', '', '파형', '접수', '', 'false', '', '', '', '2025-12-15T10:00:00', '2025-12-15T10:00:00'],
  // 뇌형급 (example)
  ['inc-003', '20251231-001', '0003PSYA.2025.가03', '서울특별시 종로구 청운동 폐가', '뇌형', '접수', '야간 산책 중 폐가에서 인간이 아닌 것으로 추정되는 그림자 목격. 목격자 정신 오염 의심.', 'false', '', '', '', '2025-12-31T02:30:00', '2025-12-31T02:30:00'],
  ['inc-004', '20251229-001', '0004PSYA.2025.가04', '부산광역시 해운대구 해변로', '뇌형', '구조중', '해변에서 원인 불명의 안개 발생. 안개 내 실종자 3명.', 'false', '', '소금 결계 설치', '', '2025-12-29T14:00:00', '2025-12-31T08:00:00'],
  // 고형급 (examples)
  ['inc-005', '20251215-001', '0005PSYA.2025.가05', '전라남도 담양군 죽녹원', '고형', '정리대기', '대나무 숲에서 정체불명의 소리 반복 발생. 구조 완료.', 'true', '', '', '', '2025-12-15T10:00:00', '2025-12-31T07:00:00'],
  ['inc-006', '20251220-001', '0006PSYA.2025.가06', '강원도 평창군 대관령', '고형', '종결', '눈보라 속 방황하는 영혼 목격. 안정화 완료.', 'true', '', '', '', '2025-12-20T06:00:00', '2025-12-28T16:00:00'],
  // Empty rows to fill
  ['inc-007', '', '', '', '파형', '접수', '', 'false', '', '', '', '', ''],
  ['inc-008', '', '', '', '뇌형', '접수', '', 'false', '', '', '', '', ''],
];
const wsIncidents = XLSX.utils.aoa_to_sheet(incidentsData);
XLSX.utils.book_append_sheet(wb, wsIncidents, 'incidents');

// 3. APPROVALS SHEET
const approvalsData = [
  ['id', 'type', 'title', 'content', 'status', 'createdBy', 'approver', 'createdAt', 'relatedIncidentId', 'rejectReason'],
  ['appr-001', '조사보고서', '청운동 폐가 조사 보고', '조사 결과 뇌형급 재난으로 판정합니다. 인간이 아닌 존재로 추정되는 그림자가 목격되었으며, 목격자는 경미한 정신 오염 증상을 보이고 있습니다.', '결재대기', 'agent-005', 'agent-001', '2025-12-31T10:00:00', 'inc-003', ''],
  ['appr-002', '출동일지', '해운대 안개 사건 구조 작전', '현무1팀 출동. 소금 결계 설치 후 실종자 3명 전원 구조 완료. 오염도 경미.', '승인', 'agent-002', 'agent-001', '2025-12-31T14:00:00', 'inc-004', ''],
  ['appr-003', '장비품의서', '도깨비 초롱 대여 신청', '파주 A구역 조사를 위해 도깨비 초롱 대여를 신청합니다.', '작성중', 'agent-003', 'agent-004', '2025-12-31T15:00:00', '', ''],
  ['appr-004', '시말서', '도깨비 시련 발동 사고 경위서', '도깨비 초롱 사용 중 개인 정보가 노출되어 도깨비 시련이 발동되었습니다. 향후 공용 장비로만 사용하겠습니다.', '반려', 'agent-002', 'agent-001', '2025-12-20T10:00:00', '', '재발 방지 대책 미흡'],
  ['appr-005', '방문품의서', '용천 선녀탕 방문 신청', '현재 오염도 35%로 주의 단계입니다. 정화를 위해 용천 선녀탕 방문을 신청합니다.', '승인', 'agent-002', 'agent-001', '2025-12-31T11:00:00', '', ''],
  ['appr-006', '', '', '', '작성중', '', '', '', '', ''],
  ['appr-007', '', '', '', '작성중', '', '', '', '', ''],
];
const wsApprovals = XLSX.utils.aoa_to_sheet(approvalsData);
XLSX.utils.book_append_sheet(wb, wsApprovals, 'approvals');

// 4. MESSAGES SHEET
const messagesData = [
  ['id', 'senderId', 'receiverId', 'title', 'content', 'createdAt', 'isRead'],
  ['msg-001', 'system', 'agent-002', '오염도 주의 안내', '귀하의 현재 오염도가 35%입니다. 용천 선녀탕 방문을 권장합니다.', '2025-12-31T09:00:00', 'false'],
  ['msg-002', 'system', 'agent-003', '장비 반납 안내', '대여 중인 악의 저울(eq-002)의 반납 기한이 내일입니다.', '2025-12-31T10:00:00', 'true'],
  ['msg-003', 'agent-001', 'agent-002', '파주 A구역 작전 브리핑', '내일 오전 9시 파주 A구역 조사 작전이 있습니다. 해태상 지참 필수.', '2025-12-31T14:00:00', 'false'],
  ['msg-004', 'system', 'agent-002', '결재 승인 알림', '용천 선녀탕 방문 신청이 승인되었습니다.', '2025-12-31T12:00:00', 'true'],
  ['msg-005', 'agent-004', 'agent-001', '도깨비 초롱 재충전 필요', '현무3팀에서 사용 중인 도깨비 초롱이 3일 후 재충전이 필요합니다.', '2025-12-31T11:00:00', 'false'],
  ['msg-006', '', '', '', '', '', 'false'],
  ['msg-007', '', '', '', '', '', 'false'],
];
const wsMessages = XLSX.utils.aoa_to_sheet(messagesData);
XLSX.utils.book_append_sheet(wb, wsMessages, 'messages');

// 5. EQUIPMENT SHEET (all 13 items from requirements)
const equipmentData = [
  ['id', 'name', 'category', 'description', 'totalStock', 'availableStock', 'requiresApproval', 'specialNote'],
  // 일반 장비
  ['eq-001', '도깨비불', '일반대여', '어둠 속 길 안내용 조명 장비', 10, 8, 'true', ''],
  ['eq-002', '악의 저울', '일반대여', '오염도 측정 장비', 5, 3, 'true', ''],
  ['eq-003', '간이 유리감옥', '일반대여', '소형 개체 봉인용 감금 장치', 8, 6, 'true', ''],
  ['eq-004', '해태상(소형)', '일반대여', '결계 설치용 해태 조각상', 12, 10, 'true', ''],
  ['eq-005', '줄잡이', '일반대여', '괴담 존재 포획 및 제어용 특수 밧줄', 15, 12, 'true', ''],
  ['eq-006', '신발끈', '일반대여', '빠른 이동 및 긴급 탈출용 신발', 20, 18, 'true', ''],
  // 고위급 장비
  ['eq-007', '은심장', '고위급대여', '착용자를 선한 사람으로 인정받게 하여 집단 영향력 행사', 3, 2, 'true', '탐라행 급행열차 사건 이후 대여만 가능. 팀장급 이상 승인 필요'],
  ['eq-008', '도깨비 초롱', '고위급대여', '특수 조명 및 탐사용 초롱', 5, 4, 'true', '3일 후 재충전 필요. 개인 정보 제출 시 도깨비 시련 발동 위험'],
  ['eq-009', '도깨비 감투', '고위급대여', '착용 시 투명화 능력 부여', 2, 1, 'true', '특별 승인 필요. 부장급 이상 결재'],
  // 지급 물품
  ['eq-010', '유리 손포', '지급', '오염 물질 취급용 특수 장갑', 500, 450, 'false', '소모품'],
  ['eq-011', '포승줄', '지급', '봉인 문양이 새겨진 특수 포승줄', 200, 180, 'false', '소모품'],
  ['eq-012', '시큼달큼', '지급', '정신 오염 해독 및 안정화용 사탕', 1000, 950, 'false', '소모품. 복용 후 30분 효과 지속'],
  ['eq-013', '메모리얼 그립톡', '지급', '기억 고정 및 정신 보호용 휴대폰 액세서리', 150, 120, 'false', '도깨비공방 제작. 분실 시 즉시 보고'],
];
const wsEquipment = XLSX.utils.aoa_to_sheet(equipmentData);
XLSX.utils.book_append_sheet(wb, wsEquipment, 'equipment');

// 6. LOCATIONS SHEET (all 4 locations)
const locationsData = [
  ['id', 'name', 'description', 'operatingHours', 'requiresApproval', 'specialNote'],
  ['loc-001', '도깨비 공방', '특수 장비 제작 및 수리. 초재관 주요 장비 제작처로 비밀 협력 관계 유지', '09:00-18:00', 'false', '초재관과 비밀 협력 관계. 메모리얼 그립톡 등 대부분 장비 제작'],
  ['loc-002', '바리데기 세공소', '봉인 장치 및 부적 제작. 전통 방식의 영적 도구 제작 전문', '10:00-17:00', 'false', '전통 부적 및 봉인 도구 전문'],
  ['loc-003', '이정 책방', '고문서 열람 및 괴담 관련 역사 연구 시설', '08:00-20:00', 'false', '고서적 및 과거 재난 기록 보관'],
  ['loc-004', '용천 선녀탕', '정신 오염 정화 전문 시설. 방문 시 오염도 -30% 효과', '06:00-22:00', 'true', '오염도 -30% 효과. 승인 필요. 월 2회 제한'],
];
const wsLocations = XLSX.utils.aoa_to_sheet(locationsData);
XLSX.utils.book_append_sheet(wb, wsLocations, 'locations');

// 7. SCHEDULES SHEET
const schedulesData = [
  ['id', 'title', 'type', 'date', 'relatedId'],
  ['sch-001', '정기 안전 교육', '훈련', '2026-01-02T10:00:00', ''],
  ['sch-002', '도깨비 공방 방문', '방문예약', '2026-01-02T14:00:00', 'loc-001'],
  ['sch-003', '청운동 재난 조사', '작전', '2026-01-03T09:00:00', 'inc-003'],
  ['sch-004', '야간 당직', '당직', '2026-01-02T22:00:00', ''],
  ['sch-005', '월간 보고서 제출', '결재마감', '2026-01-05T18:00:00', ''],
  ['sch-006', '파주 A구역 재조사', '작전', '2026-01-04T09:00:00', 'inc-001'],
  ['sch-007', '용천 선녀탕 방문', '방문예약', '2026-01-03T15:00:00', 'loc-004'],
  ['sch-008', '해태상 정기 점검', '작전', '2026-01-06T11:00:00', ''],
  ['sch-009', '신입 요원 교육', '훈련', '2026-01-07T10:00:00', ''],
  ['sch-010', '', '', '', ''],
];
const wsSchedules = XLSX.utils.aoa_to_sheet(schedulesData);
XLSX.utils.book_append_sheet(wb, wsSchedules, 'schedules');

// 8. NOTIFICATIONS SHEET (from research)
const notificationsData = [
  ['id', 'title', 'content', 'isUrgent', 'createdAt', 'isRead', 'department'],
  ['noti-001', '[긴급] 파주 A구역 접근 금지 안내', '파주시 접경지역 A구역에서 멸형급 재난이 발생했습니다. 시간 왜곡 현상으로 인해 진입자 실종 사고가 발생하고 있습니다. 해당 구역 100m 이내 접근을 금지하며, 조사는 해태상 보유자만 가능합니다.', 'true', '2025-12-30T19:00:00', 'false', ''],
  ['noti-002', '12월 식단표 안내', '12월 구내식당 식단표입니다. 금일 점심: 김치찌개, 동치미, 계란말이. 석식: 된장찌개, 배추김치, 고등어구이', 'false', '2025-12-01T09:00:00', 'true', ''],
  ['noti-003', '[보안] 페르소나 키 관리 수칙', '페르소나 키(실명)는 절대 외부에 노출되어서는 안 됩니다. 작전 중에는 반드시 코드명을 사용하시기 바랍니다. 위반 시 징계 조치됩니다.', 'true', '2025-12-15T11:00:00', 'true', ''],
  ['noti-004', '[현무팀] 도깨비 시련 발동 사고 재발 방지 안내', '최근 도깨비 초롱 사용 중 개인 정보가 노출되어 도깨비 시련이 발동되는 사고가 발생했습니다. 도깨비 초롱은 반드시 공용 장비로만 사용하시기 바랍니다. 개인 정보 제출 절대 금지.', 'false', '2025-12-20T10:00:00', 'false', 'hyunmu'],
  ['noti-005', '연말 정산 서류 제출 안내', '2025년 연말 정산 서류를 1월 15일까지 인사팀에 제출해주시기 바랍니다.', 'false', '2025-12-20T10:00:00', 'false', ''],
  ['noti-006', '[긴급] 은심장 대여 제한 안내', '탐라행 급행열차 사건 이후 은심장의 무분별한 사용으로 인한 부작용이 보고되었습니다. 향후 은심장은 팀장급 이상 승인 하에 대여만 가능하도록 제한됩니다.', 'true', '2025-11-10T14:00:00', 'true', ''],
  ['noti-007', '용천 선녀탕 이용 안내', '오염도 30% 이상 요원은 용천 선녀탕 이용을 적극 권장합니다. 예약은 사내 시스템을 통해 신청 가능하며, 월 2회까지 이용 가능합니다.', 'false', '2025-12-10T09:00:00', 'true', ''],
  ['noti-008', '', '', 'false', '', 'false', ''],
];
const wsNotifications = XLSX.utils.aoa_to_sheet(notificationsData);
XLSX.utils.book_append_sheet(wb, wsNotifications, 'notifications');

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '..', 'data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (err) {
  // Directory already exists
}

// Write to file
const outputPath = join(dataDir, 'haetae_data_template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Excel template created successfully at: ${outputPath}`);
console.log('\n📊 Summary:');
console.log('- 8 sheets created: agents, incidents, approvals, messages, equipment, locations, schedules, notifications');
console.log('- Example data from research included (현무팀 4 agents, equipment list, notices)');
console.log('- Empty rows provided for user to fill in');
console.log('\nNext: Fill in the empty rows with your data and save the file.');
