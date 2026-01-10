import { Agent, Incident, Message, Notification, ApprovalDocument, Schedule, Equipment, VisitLocation, Manual, InspectionRequest } from '@/types/haetae';

// Import Global Data (Centralized)
import GLOBAL_INCIDENTS_JSON from '@/data/global/incidents.json';
import GLOBAL_NOTIFICATIONS_JSON from '@/data/global/notifications.json';
import GLOBAL_EQUIPMENT_JSON from '@/data/global/equipment.json';
import GLOBAL_LOCATIONS_JSON from '@/data/global/locations.json';
import GLOBAL_MANUALS_JSON from '@/data/global/manuals.json';
import GLOBAL_MESSAGES_JSON from '@/data/global/messages.json';
import GLOBAL_APPROVALS_JSON from '@/data/global/approvals.json';
import GLOBAL_SCHEDULES_JSON from '@/data/global/schedules.json';
import GLOBAL_INSPECTIONS_JSON from '@/data/global/inspections.json';

import { parseDateValue } from '@/utils/dateUtils';

// Helper to parse dates in JSON data
function parseDates<T>(item: any): any {
    if (!item) return item;

    // Recursively handle arrays
    if (Array.isArray(item)) {
        return item.map(sub => parseDates(sub));
    }

    // Recursively handle objects
    if (typeof item === 'object' && item !== null) {
        // If it's already a Date object, return it (though parseDateValue handles it too)
        if (item instanceof Date) return item;

        const newItem = { ...item };

        // Explicitly handle date fields
        const DATE_FIELDS = ['createdAt', 'updatedAt', 'resolvedAt', 'startDate', 'endDate', 'date', 'rentalDate', 'dueDate', 'processedAt', 'lastUpdated', 'assignedAt', 'completedAt', 'scheduledDate'];

        Object.keys(newItem).forEach(key => {
            if (DATE_FIELDS.includes(key)) {
                newItem[key] = parseDateValue(newItem[key]);
            } else if (typeof newItem[key] === 'object') {
                newItem[key] = parseDates(newItem[key]);
            }
        });
        return newItem as T;
    }

    return item;
}

const GLOBAL_INCIDENTS = parseDates<Incident>(GLOBAL_INCIDENTS_JSON);
const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];
const GLOBAL_MANUALS = parseDates<Manual>(GLOBAL_MANUALS_JSON);
const GLOBAL_MESSAGES = parseDates<Message>(GLOBAL_MESSAGES_JSON);
const GLOBAL_APPROVALS = parseDates<ApprovalDocument>(GLOBAL_APPROVALS_JSON);
const GLOBAL_SCHEDULES = parseDates<Schedule>(GLOBAL_SCHEDULES_JSON);
const GLOBAL_INSPECTIONS = parseDates<InspectionRequest>(GLOBAL_INSPECTIONS_JSON);


export const DataManager = {
    // Incidents: Global only (Unified)
    getIncidents: (agent: Agent | null) => {
        return GLOBAL_INCIDENTS;
    },

    // Messages: Centralized with Filtering
    getMessages: (agent: Agent | null) => {
        if (!agent) return GLOBAL_MESSAGES.filter((m: any) => !m.receiverId || m.receiverId === 'all'); // Fallback for no agent

        // Get messages where I am the receiver OR I am the sender
        return GLOBAL_MESSAGES.filter((msg: Message) =>
            msg.receiverId === agent.id ||
            msg.receiverId === agent.personaKey ||
            msg.senderId === agent.id ||
            msg.senderId === agent.personaKey
        ).sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    // Notifications: Global + Personal filtering (if we add targetId to notifications later)
    getNotifications: (agent: Agent | null) => {
        // Currently notifications are global or mixed. 
        // If we want personal, we should add 'targetAgentId' to Notification type.
        // For now, return all global notifications + any filtered by logic if needed.
        return GLOBAL_NOTIFICATIONS;
    },

    // Approvals: Centralized with Filtering
    getApprovals: (agent: Agent | null) => {
        if (!agent) return [];
        // Show approvals created by me OR approvals where I am the approver
        return GLOBAL_APPROVALS.filter((doc: ApprovalDocument) =>
            doc.createdBy === agent.id ||
            doc.createdBy === agent.personaKey ||
            doc.approver === agent.id ||
            doc.approver === agent.personaKey
        );
    },

    // Schedules: Centralized with Filtering
    getSchedules: (agent: Agent | null) => {
        if (!agent) return [];
        // Filter schedules for this agent
        return GLOBAL_SCHEDULES.filter((s: Schedule) => !s.agentId || s.agentId === agent.id || s.agentId === agent.personaKey);
    },

    // Equipment: Global only (same for everyone)
    getEquipment: () => GLOBAL_EQUIPMENT,

    // Locations: Global only (same for everyone)
    getLocations: () => GLOBAL_LOCATIONS,

    // Manuals: Global only
    getManuals: () => GLOBAL_MANUALS,

    getManual: (id: string) => GLOBAL_MANUALS.find((m: Manual) => m.id === id),

    // 캐싱된 통계 데이터
    _statsCache: null as ReturnType<typeof DataManager.getStats> | null,
    _statsCacheTime: 0,

    getStats: () => {
        const now = Date.now();
        const CACHE_DURATION = 60000; // 1분 캐싱

        // 캐시가 유효하면 반환
        if (DataManager._statsCache && (now - DataManager._statsCacheTime) < CACHE_DURATION) {
            return DataManager._statsCache;
        }

        // Use only GLOBAL_INCIDENTS for consistent stats
        const allIncidents = GLOBAL_INCIDENTS;

        // Get current month start date
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Filter incidents created this month
        const thisMonthIncidents = allIncidents.filter(inc =>
            new Date(inc.createdAt) >= monthStart
        );

        const stats = {
            baekho: {
                received: thisMonthIncidents.filter(inc => inc.status === '접수').length,
                investigating: allIncidents.filter(inc => inc.status === '조사중').length,
                completed: allIncidents.filter(inc =>
                    inc.status !== '접수' && inc.status !== '조사중'
                ).length,
            },
            hyunmu: {
                requests: thisMonthIncidents.filter(inc =>
                    inc.status === '구조대기' || inc.status === '구조중'
                ).length,
                rescuing: allIncidents.filter(inc => inc.status === '구조중').length,
                completed: allIncidents.filter(inc =>
                    inc.status === '정리대기' || inc.status === '정리중' || inc.status === '종결' || inc.status === '봉인'
                ).length,
            },
            jujak: {
                requests: thisMonthIncidents.filter(inc =>
                    inc.status === '정리대기' || inc.status === '정리중'
                ).length,
                cleaning: allIncidents.filter(inc => inc.status === '정리중').length,
                completed: allIncidents.filter(inc => inc.status === '종결' || inc.status === '봉인').length,
            },
        };

        // 캐시 저장
        DataManager._statsCache = stats;
        DataManager._statsCacheTime = now;

        return stats;
    },

    // Inspection Requests
    getInspectionRequests: (agent: Agent | null): InspectionRequest[] => {
        if (!agent) return [];
        return GLOBAL_INSPECTIONS.filter((req: InspectionRequest) => req.agentId === agent.id || req.agentId === agent.personaKey);
    }
};
