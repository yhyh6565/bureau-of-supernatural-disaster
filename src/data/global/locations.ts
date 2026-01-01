import { VisitLocation } from '@/data/extendedMockData';

export const GLOBAL_LOCATIONS: VisitLocation[] = [
    { id: 'loc-001', name: '도깨비 공방', description: '특수 장비 제작 및 수리. 초재관 주요 장비 제작처로 비밀 협력 관계 유지', requiresApproval: false, operatingHours: '09:00-18:00' },
    { id: 'loc-002', name: '바리데기 세공소', description: '봉인 장치 및 부적 제작. 전통 방식의 영적 도구 제작 전문', requiresApproval: false, operatingHours: '10:00-17:00' },
    { id: 'loc-003', name: '이정 책방', description: '고문서 열람 및 괴담 관련 역사 연구 시설', requiresApproval: false, operatingHours: '08:00-20:00' },
    { id: 'loc-004', name: '용천 선녀탕', description: '정신 오염 정화 전문 시설. 방문 시 오염도 -30% 효과', requiresApproval: true, operatingHours: '06:00-22:00' },
    { id: 'loc-005', name: '구내식당', description: '직원 식당 (석식은 17:30부터)', requiresApproval: false, operatingHours: '11:30-13:30' },
    { id: 'loc-006', name: '체력단련실', description: '지하 1층 헬스장 (실내운동화 지참 필수)', requiresApproval: false, operatingHours: '06:00-23:00' },
    { id: 'loc-007', name: '수면실', description: '당직자용 휴게실 (남녀 구분)', requiresApproval: false, operatingHours: '24시간' },
];
