import React, { createContext, useContext, ReactNode } from 'react';
import { Schedule, ApprovalDocument, InspectionRequest, Incident, VisitLocation } from '@/types/haetae';
import { useAuthStore } from '@/store/authStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useBureauStore } from '@/store/bureauStore';

// Hooks
import { useWorkIncidents } from '@/hooks/work/useWorkIncidents';
import { useWorkSchedules } from '@/hooks/work/useWorkSchedules';
import { useWorkApprovals } from '@/hooks/work/useWorkApprovals';
import { useWorkInspections } from '@/hooks/work/useWorkInspections';

interface WorkContextType {
    schedules: Schedule[];
    approvals: ApprovalDocument[];
    inspectionRequests: InspectionRequest[];
    acceptedIncidentIds: string[];
    processedIncidents: Incident[];
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

export function WorkProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuthStore();
    const { triggeredIds } = useInteractionStore();
    const { mode } = useBureauStore();

    // 1. Incidents Management
    const { acceptedIncidentIds, processedIncidents, acceptIncident } = useWorkIncidents(
        agent,
        mode === 'segwang' ? 'segwang' : 'normal',
        triggeredIds
    );

    // 2. Schedules Management (Dep: processedIncidents)
    const { schedules, addSchedule, addVisitSchedule, addRawSchedule } = useWorkSchedules(
        agent,
        mode === 'segwang' ? 'segwang' : 'normal',
        processedIncidents
    );

    // 3. Approvals Management
    const { approvals, addApproval } = useWorkApprovals(
        agent,
        mode === 'segwang' ? 'segwang' : 'normal'
    );

    // 4. Inspections Management
    const { inspectionRequests, addInspectionRequestHelper } = useWorkInspections(agent);

    // Composite Actions
    const addInspectionRequest = (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string) => {
        // 1. Create Inspection Request
        addInspectionRequestHelper(type, date, symptoms);

        // 2. Create Linked Schedule
        const newSchedule: Schedule = {
            id: `sch-insp-${Date.now()}`,
            title: `${type} 예약`,
            type: '방문예약',
            date: date,
        };
        addRawSchedule(newSchedule);
    };

    return (
        <WorkContext.Provider value={{
            schedules,
            approvals,
            inspectionRequests,
            acceptedIncidentIds,
            processedIncidents,
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

