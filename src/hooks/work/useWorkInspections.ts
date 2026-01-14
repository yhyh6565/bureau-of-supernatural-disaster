import { useMemo, useEffect } from 'react';
import { InspectionRequest, Agent } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { usePersistentState } from '@/hooks/usePersistentState';
import * as scheduleService from '@/services/scheduleService';

const STORAGE_KEYS = {
    INSPECTIONS: 'haetae_session_inspections',
};

const parseInspections = (data: any[]): InspectionRequest[] => {
    return data.map(item => ({
        ...item,
        scheduledDate: new Date(item.scheduledDate),
        createdAt: new Date(item.createdAt)
    }));
};

export function useWorkInspections(agent: Agent | null) {
    const [sessionInspections, setSessionInspections] = usePersistentState<InspectionRequest[]>(
        STORAGE_KEYS.INSPECTIONS,
        [],
        parseInspections
    );

    useEffect(() => {
        if (!agent) {
            setSessionInspections([]);
        }
    }, [agent, setSessionInspections]);

    const inspectionRequests = useMemo(() => {
        if (!agent) return [];
        const base = DataManager.getInspectionRequests(agent);
        return [...sessionInspections, ...base];
    }, [agent, sessionInspections]);

    const addInspectionRequestHelper = (
        type: '정기검사' | '정밀검사' | '긴급검사',
        date: Date,
        symptoms: string
    ) => {
        if (!agent) return null;
        const newRequest = scheduleService.createInspectionRequest(type, date, symptoms, agent.id);
        setSessionInspections((prev: InspectionRequest[]) => [newRequest, ...prev]);
        return newRequest;
    };

    return {
        inspectionRequests,
        addInspectionRequestHelper
    };
}
