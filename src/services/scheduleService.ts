import { Schedule, VisitLocation, InspectionRequest } from '@/types/haetae';

// 일정(스케줄) 생성
export const createSchedule = (
    data: Omit<Schedule, 'id'>
): Schedule => {
    return {
        id: `sch-${Date.now()}`,
        ...data
    };
};

// 방문 예약 일정 생성 헬퍼
export const createVisitSchedule = (
    location: VisitLocation,
    date: Date
): Schedule => {
    return {
        id: `sch-visit-${Date.now()}`,
        title: `${location.name} 방문`,
        type: '방문예약', // ScheduleType에 '방문예약'이 있어야 함. 기존 타입 확인 필요. 
        // 만약 타입 에러 나면 '기타'나 '외근' 등 유효한 값으로 변경 필요.
        date: date,
        relatedId: location.id
    };
};


// 오염 검사 요청 생성
// 오염 검사 요청 생성
export const createInspectionRequest = (
    type: '정기검사' | '정밀검사' | '긴급검사',
    date: Date,
    symptoms: string,
    agentId: string
): InspectionRequest => {
    return {
        id: `insp-${Date.now()}`,
        agentId,
        type,
        status: '신청',
        scheduledDate: date,
        symptoms,
        createdAt: new Date()
    };
};
