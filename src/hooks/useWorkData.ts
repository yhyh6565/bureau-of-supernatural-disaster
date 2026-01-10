import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';
import { useWorkStore, getCombinedSchedules, getProcessedIncidents, getCombinedApprovals, getCombinedInspections } from '@/store/workStore';
import { useInteractionStore } from '@/store/interactionStore';

export function useWorkData() {
    const { agent } = useAuthStore();
    const { mode } = useBureauStore();
    const {
        sessionSchedules,
        sessionApprovals,
        sessionInspections,
        acceptedIncidentIds,
        addSchedule,
        addVisitSchedule,
        addApproval,
        addInspectionRequest,
        acceptIncident
    } = useWorkStore();
    const { triggeredIds } = useInteractionStore();

    const processedIncidents = useMemo(() => {
        if (!agent) return [];
        return getProcessedIncidents(agent, mode, acceptedIncidentIds, triggeredIds);
    }, [agent, mode, acceptedIncidentIds, triggeredIds]);

    const schedules = useMemo(() => {
        if (!agent) return [];
        return getCombinedSchedules(agent, mode, sessionSchedules, processedIncidents);
    }, [agent, mode, sessionSchedules, processedIncidents]);

    const approvals = useMemo(() => {
        if (!agent) return [];
        return getCombinedApprovals(agent, mode, sessionApprovals);
    }, [agent, mode, sessionApprovals]);

    const inspectionRequests = useMemo(() => {
        if (!agent) return [];
        return getCombinedInspections(agent, sessionInspections);
    }, [agent, sessionInspections]);

    return {
        schedules,
        approvals,
        inspectionRequests,
        processedIncidents,
        acceptedIncidentIds,
        addSchedule,
        addVisitSchedule,
        addApproval,
        addInspectionRequest,
        acceptIncident
    };
}
