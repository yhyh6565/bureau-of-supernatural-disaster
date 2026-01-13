import { Agent } from '@/types/haetae';

/**
 * Checks if an agent is currently active (i.e., not resigned or on leave).
 * @param agent The agent object to check.
 * @returns true if the agent is active, false otherwise.
 */
export const isAgentActive = (agent: Agent | null | undefined): boolean => {
    if (!agent) return false;
    return agent.status !== 'resigned';
};
