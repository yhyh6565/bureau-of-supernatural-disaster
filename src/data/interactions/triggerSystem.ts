// 트리거 시스템 - 조건에 따라 interaction 발현 여부 결정

import { Interaction, TriggerCondition } from './types';
import { Agent } from '@/types/haetae';

/**
 * 트리거 조건을 평가하여 interaction을 표시할지 결정
 */
export class TriggerSystem {
  /**
   * 트리거 조건 체크
   */
  static checkTrigger(condition: TriggerCondition): boolean {
    switch (condition.type) {
      case 'date-range':
        return this.checkDateRange(condition);

      case 'random':
        return this.checkRandom(condition);

      case 'condition':
        return condition.customCheck ? condition.customCheck() : false;

      // time-elapsed, button-click, page-visit 등은
      // 컴포넌트 레벨에서 처리 (useEffect, onClick 등)
      case 'login':
      case 'time-elapsed':
      case 'button-click':
      case 'page-visit':
        return true; // 기본적으로 통과

      default:
        return false;
    }
  }

  /**
   * 날짜 범위 체크
   */
  private static checkDateRange(condition: TriggerCondition): boolean {
    if (!condition.dateRange) return false;

    const now = new Date();
    const { start, end } = condition.dateRange;

    return now >= start && now <= end;
  }

  /**
   * 랜덤 확률 체크
   */
  private static checkRandom(condition: TriggerCondition): boolean {
    if (!condition.probability) return false;

    return Math.random() < condition.probability;
  }

  /**
   * 특정 agent가 수신 대상인지 확인
   */
  static isRecipient(interaction: Interaction, agent: Agent): boolean {
    if (interaction.to === 'all') return true;

    if (Array.isArray(interaction.to)) {
      return interaction.to.includes(agent.id);
    }

    return interaction.to === agent.id;
  }

  /**
   * agent가 받을 수 있는 모든 interaction 필터링
   */
  static getAvailableInteractions(
    interactions: Interaction[],
    agent: Agent
  ): Interaction[] {
    return interactions.filter(interaction => {
      // 수신 대상 체크
      if (!this.isRecipient(interaction, agent)) return false;

      // 트리거 조건 체크
      return this.checkTrigger(interaction.trigger);
    });
  }

  /**
   * 지연 시간 기반 트리거 (컴포넌트에서 사용)
   * @example
   * useEffect(() => {
   *   const timer = TriggerSystem.scheduleTimeElapsed(interaction, () => {
   *     showMessage(interaction);
   *   });
   *   return () => clearTimeout(timer);
   * }, []);
   */
  static scheduleTimeElapsed(
    interaction: Interaction,
    callback: () => void
  ): NodeJS.Timeout | null {
    if (interaction.trigger.type !== 'time-elapsed') return null;

    const delay = interaction.trigger.delay || 0;
    return setTimeout(callback, delay);
  }
}
