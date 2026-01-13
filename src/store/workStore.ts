import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Schedule, ApprovalDocument, InspectionRequest, Incident, Agent, VisitLocation } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import * as approvalService from '@/services/approvalService';
import * as scheduleService from '@/services/scheduleService';

import segwangSchedules from '@/data/segwang/schedules.json';
import segwangApprovals from '@/data/segwang/approvals.json';

// const segwangSchedules = segwangSchedulesData.segwangSchedules; // removed
// const segwangApprovals = segwangApprovalsData.segwangApprovals; // removed

interface WorkState {
    // Session State (Persisted)
    sessionSchedules: Schedule[];
    sessionApprovals: ApprovalDocument[];
    sessionInspections: InspectionRequest[];
    acceptedIncidentIds: string[];

    // Computed / Actions
    addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
    addVisitSchedule: (location: VisitLocation, date: Date) => void;
    addApproval: (doc: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>, agent: Agent) => void;
    addInspectionRequest: (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string, agent: Agent) => void;
    acceptIncident: (id: string) => void;

    // Selectors helpers (instead of computing inside store, we provide raw data access or simple gets)
    // Actually, consumers usually need the *combined* list. 
    // We will provide regular state, and consumers can assume standard combination logic OR we give helper functions.
    // For simplicity and matching Context API usage, we can expose the raw session data and let a hook or component combine it,
    // OR we can make this store strict about managing modifications only.

    resetSession: () => void;
}

export const useWorkStore = create<WorkState>()(
    persist(
        (set, get) => ({
            sessionSchedules: [],
            sessionApprovals: [],
            sessionInspections: [],
            acceptedIncidentIds: [],

            addSchedule: (data) => {
                const newSchedule = scheduleService.createSchedule(data);
                set(state => ({ sessionSchedules: [...state.sessionSchedules, newSchedule] }));
            },

            addVisitSchedule: (location, date) => {
                const newSchedule = scheduleService.createVisitSchedule(location, date);
                set(state => ({ sessionSchedules: [...state.sessionSchedules, newSchedule] }));
            },

            addApproval: (data, agent) => {
                const newDoc = approvalService.createApprovalDocument(data, agent);
                set(state => ({ sessionApprovals: [newDoc, ...state.sessionApprovals] }));
            },

            addInspectionRequest: (type, date, symptoms, agent) => {
                const newRequest = scheduleService.createInspectionRequest(type, date, symptoms, agent.id);
                // Also add to schedule
                const newSchedule: Schedule = {
                    id: `sch-insp-${Date.now()}`,
                    title: `${type} 예약`,
                    type: '방문예약',
                    date: date,
                };

                set(state => ({
                    sessionInspections: [newRequest, ...state.sessionInspections],
                    sessionSchedules: [...state.sessionSchedules, newSchedule]
                }));
            },

            acceptIncident: (id) => {
                set(state => {
                    if (state.acceptedIncidentIds.includes(id)) return state;
                    return { acceptedIncidentIds: [...state.acceptedIncidentIds, id] };
                });
            },

            resetSession: () => {
                set({
                    sessionSchedules: [],
                    sessionApprovals: [],
                    sessionInspections: [],
                    acceptedIncidentIds: []
                });
            }
        }),
        {
            name: 'haetae_work_session',
            storage: createJSONStorage(() => sessionStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Revive Dates
                    if (state.sessionSchedules) {
                        state.sessionSchedules = state.sessionSchedules.map((s: any) => ({ ...s, date: new Date(s.date) }));
                    }
                    if (state.sessionApprovals) {
                        state.sessionApprovals = state.sessionApprovals.map((a: any) => ({
                            ...a,
                            createdAt: new Date(a.createdAt),
                            processedAt: a.processedAt ? new Date(a.processedAt) : undefined
                        }));
                    }
                    if (state.sessionInspections) {
                        state.sessionInspections = state.sessionInspections.map((i: any) => ({
                            ...i,
                            scheduledDate: new Date(i.scheduledDate),
                            createdAt: new Date(i.createdAt)
                        }));
                    }
                }
            }
        }
    )
);

// Helper function to combine data (formerly useMemo in Context)
// Can be used by components: const combined = getCombinedSchedules(agent, mode, sessionSchedules);
export const getCombinedSchedules = (
    agent: Agent,
    mode: 'ordinary' | 'segwang',
    sessionSchedules: Schedule[],
    processedIncidents: Incident[]
): Schedule[] => {
    if (!agent) return [];

    // Base Data
    const baseSchedules = mode === 'segwang'
        ? (segwangSchedules as any[]).map(s => ({ ...s, date: new Date(s.date) })) as Schedule[]
        : DataManager.getSchedules(agent);

    const base = baseSchedules.filter(s => !s.title.endsWith('신청 건') && s.type !== '결재');

    // Incident Schedules
    let myIncidents: Incident[] = [];
    if (agent.department === 'baekho') myIncidents = processedIncidents.filter(inc => inc.status === '조사중');
    else if (agent.department === 'hyunmu') myIncidents = processedIncidents.filter(inc => inc.status === '구조중');
    else if (agent.department === 'jujak') myIncidents = processedIncidents.filter(inc => inc.status === '정리중');

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
};

export const getProcessedIncidents = (
    agent: Agent,
    mode: 'ordinary' | 'segwang',
    acceptedIds: string[],
    triggeredIds: string[],
    triggeredTimestamps?: Record<string, Date>
): Incident[] => {
    if (!agent) return [];

    // Get incidents based on mode (Segwang or Ordinary)
    const baseIncidents = mode === 'segwang'
        ? DataManager.getIncidents(agent, 'segwang')
        : DataManager.getIncidents(agent);

    return baseIncidents
        .filter(inc => !inc.trigger || triggeredIds.includes(inc.id)) // 트리거 필터링: trigger가 없거나 이미 발동된 것만
        .map(inc => {
            let updatedInc = { ...inc };

            // If this incident was dynamically triggered, override its createdAt with the trigger timestamp
            if (inc.trigger && triggeredTimestamps && triggeredTimestamps[inc.id]) {
                updatedInc.createdAt = triggeredTimestamps[inc.id];
            }

            if (acceptedIds.includes(inc.id)) {
                let newStatus = updatedInc.status;
                if (agent.department === 'baekho') newStatus = '조사중';
                else if (agent.department === 'hyunmu') newStatus = '구조중';
                else if (agent.department === 'jujak') newStatus = '정리중';
                return { ...updatedInc, status: newStatus as any };
            }
            return updatedInc;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getCombinedApprovals = (
    agent: Agent,
    mode: 'ordinary' | 'segwang',
    sessionApprovals: ApprovalDocument[]
): ApprovalDocument[] => {
    if (!agent) return [];

    // Use Saekwang data if in Saekwang mode
    const base = mode === 'segwang'
        ? (segwangApprovals as any[]).map(doc => ({
            ...doc,
            createdByName: 'Unknown',
            approverName: 'Unknown',
            createdBy: 'unknown-id',
            approver: 'admin-id',
            createdAt: new Date(doc.createdAt)
        })) as ApprovalDocument[]
        : DataManager.getApprovals(agent);

    return [...sessionApprovals, ...base];
};

export const getCombinedInspections = (
    agent: Agent,
    sessionInspections: InspectionRequest[]
): InspectionRequest[] => {
    if (!agent) return [];
    const base = DataManager.getInspectionRequests(agent);
    return [...sessionInspections, ...base];
};
