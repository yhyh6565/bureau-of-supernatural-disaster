
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const parseNotificationDate = (date: string | Date): Date => {
    if (typeof date === 'string') return new Date(date);
    return date;
};

export const safeFormatDate = (date: Date | string, formatStr: string = 'yyyy.MM.dd'): string => {
    try {
        const d = parseNotificationDate(date);
        return format(d, formatStr, { locale: ko });
    } catch (e) {
        return '-';
    }
};

/**
 * Formats a date string or object.
 * If isSegwang is true, replaces '2024' or '2023' (etc.) with '20■■'.
 * 
 * @param date The date to format
 * @param formatStr The date-fns format string (default: 'yyyy.MM.dd')
 * @param isSegwang Whether to apply Segwang redaction
 * @returns Formatted date string
 */
export const formatSegwangDate = (date: Date | string, formatStr: string = 'yyyy.MM.dd', isSegwang: boolean = false): string => {
    try {
        const d = parseNotificationDate(date);
        const formatted = format(d, formatStr, { locale: ko });

        if (isSegwang) {
            return formatted.replace(/20\d{2}/g, '20■■');
        }

        return formatted;
    } catch (e) {
        return '-';
    }
};
// Helper for resolving various date formats from JSON data
export const parseDateValue = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
