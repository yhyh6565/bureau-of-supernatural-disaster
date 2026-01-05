/**
 * 날짜 관련 유틸리티 함수 모음
 * @description NoticesPage 등에서 공통으로 사용하는 날짜 파싱/포맷팅 유틸리티
 */

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 다양한 형식의 날짜 문자열을 Date 객체로 변환
 * @param dateStr - ISO 8601, "relative:-2d", "fixed:01-03T10:00" 등
 * @returns Date 객체 (파싱 실패 시 현재 날짜)
 */
export function parseDateValue(dateStr: string | Date | undefined): Date {
    return parseNotificationDate(dateStr);
}

/**
 * @deprecated Use parseDateValue instead
 */
export function parseNotificationDate(dateStr: string | Date | undefined): Date {
    try {
        if (!dateStr) return new Date();
        if (dateStr instanceof Date) return dateStr;
        if (typeof dateStr !== 'string') return new Date(dateStr as unknown as string);

        let date: Date;

        // Handle relative dates (e.g. "relative:-2d")
        if (dateStr.startsWith('relative:')) {
            const daysStr = dateStr.replace('relative:', '').replace('d', '');
            const days = parseInt(daysStr, 10);
            date = new Date();
            date.setDate(date.getDate() + days);
        } else if (dateStr.startsWith('fixed:')) {
            // Handle fixed dates (e.g. "fixed:01-03T10:00")
            const timeStr = dateStr.replace('fixed:', '');
            const currentYear = new Date().getFullYear();
            date = new Date(`${currentYear}-${timeStr}`);
        } else {
            date = new Date(dateStr);
        }

        // Identify Invalid Date and fallback to Today
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date parsed: ${dateStr}. Fallback to Today.`);
            return new Date();
        }
        return date;
    } catch (e) {
        console.error("Date parsing error", e);
        return new Date();
    }
}

/**
 * 안전한 날짜 포맷팅 (에러 발생 시 폴백)
 * @param date - Date 객체
 * @param formatStr - date-fns 포맷 문자열 (예: 'yyyy.MM.dd')
 * @returns 포맷된 날짜 문자열
 */
export function safeFormatDate(date: Date, formatStr: string): string {
    try {
        if (isNaN(date.getTime())) return format(new Date(), formatStr, { locale: ko });
        return format(date, formatStr, { locale: ko });
    } catch (e) {
        console.error('Date formatting error:', e);
        const today = new Date();
        return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    }
}

/**
 * 항목이 "신규"인지 판단 (기본 7일 이내)
 * @param createdAt - 생성 날짜
 * @param daysThreshold - 신규로 간주할 일수 (기본값: 7)
 * @returns boolean
 */
export function isNewItem(createdAt: Date | string, daysThreshold: number = 7): boolean {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
}
