import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Schedule, ApprovalDocument, VisitLocation, InspectionRequest } from '@/types/haetae';
import { useAuth } from '@/contexts/AuthContext';
import { DataManager } from '@/data/dataManager';
import * as approvalService from '@/services/approvalService';
import * as scheduleService from '@/services/scheduleService';
import { usePersistentState } from '@/hooks/usePersistentState';

interface WorkContextType {
    schedules: Schedule[];
    approvals: ApprovalDocument[];
    inspectionRequests: InspectionRequest[];
    acceptedIncidentIds: string[];
    addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
    addVisitSchedule: (location: VisitLocation, date: Date) => void;
    addApproval: (doc: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>) => void;
    addInspectionRequest: (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string) => void;
    acceptIncident: (id: string) => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export function useWork() {
    const context = useContext(WorkContext);
    if (context === undefined) {
        throw new Error('useWork must be used within a WorkProvider');
    }
    return context;
}

// Session Storage Keys
const STORAGE_KEYS = {
    SCHEDULES: 'haetae_session_schedules',
    APPROVALS: 'haetae_session_approvals',
    INSPECTIONS: 'haetae_session_inspections',
    ACCEPTED_TASKS: 'haetae_session_accepted_tasks',
};

// Deserializers to restore Date objects
const parseSchedules = (data: any[]): Schedule[] => {
    return data.map(item => ({
        ...item,
        date: new Date(item.date)
    }));
};

const parseApprovals = (data: any[]): ApprovalDocument[] => {
    return data.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        processedAt: item.processedAt ? new Date(item.processedAt) : undefined
    }));
};

const parseInspections = (data: any[]): InspectionRequest[] => {
    return data.map(item => ({
        ...item,
        scheduledDate: new Date(item.scheduledDate),
        createdAt: new Date(item.createdAt)
    }));
};

export function WorkProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuth();

    // Persistent Session State (New items added during session)
    const [sessionSchedules, setSessionSchedules] = usePersistentState<Schedule[]>(
        STORAGE_KEYS.SCHEDULES,
        [],
        parseSchedules
    );

    const [sessionApprovals, setSessionApprovals] = usePersistentState<ApprovalDocument[]>(
        STORAGE_KEYS.APPROVALS,
        [],
        parseApprovals
    );

    const [sessionInspections, setSessionInspections] = usePersistentState<InspectionRequest[]>(
        STORAGE_KEYS.INSPECTIONS,
        [],
        parseInspections
    );

    const [acceptedIncidentIds, setAcceptedIncidentIds] = usePersistentState<string[]>(
        STORAGE_KEYS.ACCEPTED_TASKS,
        []
    );

    // Derived State: Combine Base Data (from DataManager) + Session Data
    const schedules = useMemo(() => {
        if (!agent) return [];
        const base = DataManager.getSchedules(agent);
        return [...base, ...sessionSchedules];
    }, [agent, sessionSchedules]);

    const approvals = useMemo(() => {
        if (!agent) return [];
        const base = DataManager.getApprovals(agent);
        return [...sessionApprovals, ...base]; // Newest first for approvals usually? Check logic.
        // Original logic was setApprovals([...baseApprovals, ...sessionApprovals])? 
        // Logic check: addApproval did `[newDoc, ...prev]`. 
        // So sessionApprovals are likely newer. 
        // If I want newest on top, usually sessionApprovals (new) + baseApprovals (old).
        // Let's stick to [...sessionApprovals, ...base].
    }, [agent, sessionApprovals]);

    const inspectionRequests = useMemo(() => {
        if (!agent) return [];
        const base = DataManager.getInspectionRequests(agent);
        return [...sessionInspections, ...base]; // Newest first
    }, [agent, sessionInspections]);


    // Actions
    const addSchedule = (data: Omit<Schedule, 'id'>) => {
        const newSchedule = scheduleService.createSchedule(data);
        setSessionSchedules(prev => [...prev, newSchedule]);
    };

    const addVisitSchedule = (location: VisitLocation, date: Date) => {
        const newSchedule = scheduleService.createVisitSchedule(location, date);
        setSessionSchedules(prev => [...prev, newSchedule]);
    };

    const addApproval = (data: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>) => {
        if (!agent) return;
        const newDoc = approvalService.createApprovalDocument(data, agent);
        setSessionApprovals(prev => [newDoc, ...prev]);
    };

    const addInspectionRequest = (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string) => {
        if (!agent) return;
        const newRequest = scheduleService.createInspectionRequest(type, date, symptoms, agent.id);
        setSessionInspections(prev => [newRequest, ...prev]);

        // Automatically add to schedule as well
        const newSchedule: Schedule = {
            id: `sch-insp-${Date.now()}`,
            title: `${type} 예약`,
            type: '방문예약',
            date: date,
        };
        setSessionSchedules(prev => [...prev, newSchedule]);
    };

    const acceptIncident = (id: string) => {
        setAcceptedIncidentIds(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    return (
        <WorkContext.Provider value={{
            schedules,
            approvals,
            inspectionRequests,
            acceptedIncidentIds,
            addSchedule,
            addVisitSchedule,
            addApproval,
            addInspectionRequest,
            acceptIncident
        }}>
            {children}
        </WorkContext.Provider>
    );
}
