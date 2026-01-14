import { useState, useMemo, useEffect } from 'react';
import { Incident, Agent } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { usePersistentState } from '@/hooks/usePersistentState';

// Session Storage Keys (from WorkContext)
const STORAGE_KEYS = {
    ACCEPTED_TASKS: 'haetae_session_accepted_tasks',
};

export function useWorkIncidents(
    agent: Agent | null,
    mode: 'normal' | 'segwang',
    triggeredIds: string[]
) {
    const [acceptedIncidentIds, setAcceptedIncidentIds] = usePersistentState<string[]>(
        STORAGE_KEYS.ACCEPTED_TASKS,
        []
    );

    // Reset when agent logs out
    useEffect(() => {
        if (!agent) {
            setAcceptedIncidentIds([]);
        }
    }, [agent, setAcceptedIncidentIds]);

    const processedIncidents = useMemo(() => {
        if (!agent) return [];

        // Use Saekwang data if in Saekwang mode
        const baseIncidents = mode === 'segwang'
            ? DataManager.getIncidents(agent, 'segwang')
            : DataManager.getIncidents(agent);

        return baseIncidents
            .filter(inc => !inc.trigger || triggeredIds.includes(inc.id)) // Filter hidden triggers (Easter Eggs)
            .map(inc => {
                // Override status if accepted in this session
                if (acceptedIncidentIds.includes(inc.id)) {
                    let newStatus = inc.status;
                    if (agent.department === 'baekho') newStatus = '조사중';
                    else if (agent.department === 'hyunmu') newStatus = '구조중';
                    else if (agent.department === 'jujak') newStatus = '정리중';

                    return { ...inc, status: newStatus as any };
                }
                return inc;
            }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [agent, acceptedIncidentIds, triggeredIds, mode]);

    const acceptIncident = (id: string) => {
        setAcceptedIncidentIds((prev: string[]) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    return {
        acceptedIncidentIds,
        processedIncidents,
        acceptIncident
    };
}
