// 페르소나 간 쪽지/메시지 이스터에그

import { Interaction } from './types';

export const INTERACTION_MESSAGES: Interaction[] = [
  // 예시 1: 최요원 → 류재관 (로그인 후 5초)
  {
    id: 'msg-001',
    type: 'message',
    from: 'agent-002', // 최요원
    to: 'agent-003',   // 류재관
    title: '점심 약속',
    content: '재관씨, 오늘 점심 같이 드실래요?\n구내식당 메뉴가 괜찮아 보이더라고요.',
    trigger: {
      type: 'time-elapsed',
      delay: 5000, // 5초
    },
    createdAt: new Date('2024-12-15'),
    priority: 'normal',
  },

  // 예시 2: 박홍림 → 전체 (특정 날짜에만)
  {
    id: 'msg-002',
    type: 'notification',
    from: 'agent-001', // 박홍림
    to: 'all',
    title: '긴급 소집',
    content: '전원 회의실로 집합. 멸형급 재난 브리핑 예정.',
    trigger: {
      type: 'date-range',
      dateRange: {
        start: new Date('2024-12-20'),
        end: new Date('2024-12-31'),
      },
    },
    priority: 'high',
  },

  // 예시 3: 김솔음 → 해금 (30% 확률)
  {
    id: 'msg-003',
    type: 'note',
    from: 'agent-004', // 김솔음
    to: 'agent-005',   // 해금
    title: '포스트잇',
    content: '언니 책상 정리 좀...',
    trigger: {
      type: 'random',
      probability: 0.3, // 30% 확률
    },
    priority: 'low',
  },

  // TODO: 원작 기반 이스터에그 추가 예정
];
