// 세션 스토리지 키
const RESERVATION_STORAGE_KEY = 'haetae_reservations';

/**
 * 운영시간 문자열에서 시간 슬롯 배열 생성
 * @param operatingHours 운영시간 문자열 (예: "09:00-18:00")
 * @returns 시간 슬롯 배열 (예: ["09:00", "10:00", ...])
 */
export function parseOperatingHours(operatingHours: string): string[] {
    const match = operatingHours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (!match) return [];

    const startHour = parseInt(match[1]);
    const endHour = parseInt(match[3]);
    const slots: string[] = [];

    // 마지막 시간은 운영 종료 1시간 전까지만 예약 가능
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
}

/**
 * 시설별 예약 슬롯 생성 (세션 스토리지에 캐싱)
 * @param locationId 시설 ID
 * @param availableSlots 운영시간 기반 가용 슬롯 배열
 * @returns 날짜별 예약된 슬롯 맵
 */
export function getOrCreateReservedSlots(locationId: string, availableSlots: string[]): Record<string, string[]> {
    const storageKey = `${RESERVATION_STORAGE_KEY}_${locationId}`;

    // 세션 스토리지에서 기존 예약 확인
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // 파싱 실패 시 새로 생성
        }
    }

    // 새로 예약 슬롯 생성
    const slots: Record<string, string[]> = {};
    const today = new Date();

    // 오늘부터 14일간 랜덤 예약 슬롯 생성
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        // 날짜별로 1~3개의 랜덤 시간대 예약 (운영시간 내에서만)
        const numReserved = Math.floor(Math.random() * 3) + 1;
        const reserved: string[] = [];
        for (let j = 0; j < numReserved; j++) {
            if (availableSlots.length > 0) {
                const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
                if (!reserved.includes(randomSlot)) {
                    reserved.push(randomSlot);
                }
            }
        }
        if (reserved.length > 0) {
            slots[dateKey] = reserved;
        }
    }

    // 세션 스토리지에 저장
    sessionStorage.setItem(storageKey, JSON.stringify(slots));
    return slots;
}
