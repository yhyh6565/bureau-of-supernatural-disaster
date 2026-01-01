// 페르소나 간 상호작용 데이터 타입 정의

export type InteractionType =
  | 'message'      // 쪽지/메시지
  | 'note'         // 메모/포스트잇
  | 'approval'     // 결재 문서
  | 'notification' // 알림
  | 'easter-egg';  // 기타 이스터에그

export type TriggerType =
  | 'login'           // 로그인 시
  | 'time-elapsed'    // 시간 경과
  | 'button-click'    // 버튼 클릭
  | 'page-visit'      // 페이지 방문
  | 'date-range'      // 특정 날짜 범위
  | 'random'          // 랜덤 확률
  | 'condition';      // 커스텀 조건

export interface TriggerCondition {
  type: TriggerType;

  // 시간 기반
  delay?: number;              // 밀리초 (time-elapsed용)
  dateRange?: {
    start: Date;
    end: Date;
  };

  // 랜덤
  probability?: number;        // 0~1 사이 확률

  // 페이지/버튼
  targetId?: string;           // 버튼 ID, 페이지 경로 등

  // 커스텀 조건 함수
  customCheck?: () => boolean;
}

export interface Interaction {
  id: string;
  type: InteractionType;

  // 발신/수신
  from: string;                // 발신자 agent.id
  to: string | string[];       // 수신자 agent.id(s), 'all'이면 전체

  // 내용
  title?: string;
  content: string;

  // 트리거 조건
  trigger: TriggerCondition;

  // 메타데이터 (선택)
  createdAt?: Date;
  priority?: 'high' | 'normal' | 'low';
}
