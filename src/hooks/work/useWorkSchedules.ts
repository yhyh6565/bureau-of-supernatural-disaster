import { useMemo, useEffect } from 'react';
import { Schedule, Agent, VisitLocation } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { usePersistentState } from '@/hooks/usePersistentState';
import * as scheduleService from '@/services/scheduleService';
import segwangSchedules from '@/data/segwang/schedules.json';

const STORAGE_KEYS = {
    SCHEDULES: 'haetae_session_schedules',
};

const parseSchedules = (data: any[]): Schedule[] => {
    return data.map(item => ({
        ...item,
        date: new Date(item.date)
    }));
};

export function useWorkSchedules(
    agent: Agent | null,
    mode: 'normal' | 'segwang',
    processedIncidents: any[] // Using processed incidents from useWorkIncidents
) {
    const [sessionSchedules, setSessionSchedules] = usePersistentState<Schedule[]>(
        STORAGE_KEYS.SCHEDULES,
        [],
        parseSchedules
    );

    useEffect(() => {
        if (!agent) {
            setSessionSchedules([]);
        }
    }, [agent, setSessionSchedules]);

    const schedules = useMemo(() => {
        if (!agent) return [];

        const baseSchedules = mode === 'segwang'
            ? (segwangSchedules as any[]).map(s => ({ ...s, date: new Date(s.date) })) as Schedule[]
            : DataManager.getSchedules(agent);

        const base = baseSchedules.filter(s => {
            return !s.title.endsWith('신청 건') && s.type !== '결재';
        });

        let myIncidents: any[] = [];
        if (agent.department === 'baekho') {
            myIncidents = processedIncidents.filter(inc => inc.status === '조사중');
        } else if (agent.department === 'hyunmu') {
            myIncidents = processedIncidents.filter(inc => inc.status === '구조중');
        } else if (agent.department === 'jujak') {
            myIncidents = processedIncidents.filter(inc => inc.status === '정리중');
        }

        const incidentSchedules: Schedule[] = myIncidents.slice(0, 3).map(inc => {
            let actionPrefix = '작전';
            if (agent.department === 'baekho') actionPrefix = '현장 조사';
            else if (agent.department === 'hyunmu') actionPrefix = '긴급 출동';
            else if (agent.department === 'jujak') actionPrefix = '사후 정리';

            return {
                id: `sch-inc-${inc.id}`,
                title: `${actionPrefix}: ${inc.title}`,
                date: new Date(),
                type: '작전',
                relatedId: inc.id
            };
        });

        return [...base, ...sessionSchedules, ...incidentSchedules];
    }, [agent, sessionSchedules, processedIncidents, mode]);

    const addSchedule = (data: Omit<Schedule, 'id'>) => {
        const newSchedule = scheduleService.createSchedule(data);
        setSessionSchedules((prev: Schedule[]) => [...prev, newSchedule]);
    };

    const addVisitSchedule = (location: VisitLocation, date: Date) => {
        const newSchedule = scheduleService.createVisitSchedule(location, date);
        setSessionSchedules((prev: Schedule[]) => [...prev, newSchedule]);
    };

    // Helper to add external schedules (used by other hooks)
    const addRawSchedule = (schedule: Schedule) => {
        setSessionSchedules((prev: Schedule[]) => [...prev, schedule]);
    };

    return {
        schedules,
        addSchedule,
        addVisitSchedule,
        addRawSchedule
    };
}
