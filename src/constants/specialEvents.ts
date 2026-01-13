/**
 * Special Events and Easter Eggs Constants
 *
 * Centralized management of special event IDs and trigger keys
 * to prevent magic strings scattered throughout the codebase.
 */

/**
 * Special incident IDs for triggered events
 */
export const SPECIAL_INCIDENTS = {
  /** 강남역 포식자 싱크홀 사건 */
  SINKHOLE: 'inc-sinkhole-001',
} as const;

/**
 * Easter egg trigger keys
 */
export const EGG_TRIGGERS = {
  /** 싱크홀 이스터에그 트리거 */
  SINKHOLE: 'egg-sinkhole',
} as const;

/**
 * Easter egg search keywords that trigger special modals
 */
export const EGG_SEARCH_KEYWORDS = {
  /** 세광 관련 키워드 */
  SEGWANG: [
    '세광', '세광특별시', '특별시',
    '0000PSYA.2024.세00', '0000PSYA.20██.세00',
    '삭제된 지역', '기억 소각', '5월 4일', '멸형급 552'
  ],
} as const;

/**
 * Type helper to get all special incident IDs
 */
export type SpecialIncidentId = typeof SPECIAL_INCIDENTS[keyof typeof SPECIAL_INCIDENTS];

/**
 * Type helper to get all egg trigger keys
 */
export type EggTriggerId = typeof EGG_TRIGGERS[keyof typeof EGG_TRIGGERS];
