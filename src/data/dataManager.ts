import { Agent, Incident, Message, Notification, ApprovalDocument, Schedule, Equipment, VisitLocation, Manual, InspectionRequest } from '@/types/haetae';

// Import Global Data (Centralized)
import GLOBAL_NOTIFICATIONS_JSON from '@/data/global/notifications.json';
import GLOBAL_EQUIPMENT_JSON from '@/data/global/equipment.json';
import GLOBAL_LOCATIONS_JSON from '@/data/global/locations.json';
import GLOBAL_MANUALS_JSON from '@/data/global/manuals.json';
import GLOBAL_MESSAGES_JSON from '@/data/global/messages.json';
import GLOBAL_APPROVALS_JSON from '@/data/global/approvals.json';
import GLOBAL_SCHEDULES_JSON from '@/data/global/schedules.json';

// Import Shared Data
import SHARED_INCIDENTS_JSON from '@/data/incidents.json';

// Import Segwang Data
import SEGWANG_APPROVALS_JSON from '@/data/segwang/approvals.json';
import SEGWANG_SCHEDULES_JSON from '@/data/segwang/schedules.json';
import SEGWANG_NOTICES_JSON from '@/data/segwang/notices.json'; // Added for checking
import SEGWANG_INCIDENTS_JSON from '@/data/segwang/incidents.json';

// Import Ordinary Data
import ORDINARY_MESSAGES_JSON from '@/data/ordinary/messages.json';
import ORDINARY_APPROVALS_JSON from '@/data/ordinary/approvals.json';
import ORDINARY_SCHEDULES_JSON from '@/data/ordinary/schedules.json';
import ORDINARY_INSPECTIONS_JSON from '@/data/ordinary/inspections.json';

import { parseDateValue } from '@/utils/dateUtils';

// Helper to parse dates in JSON data
function parseDates<T>(item: any): any {
    if (!item) return item;

    if (Array.isArray(item)) {
        return item.map(sub => parseDates(sub));
    }

    if (typeof item === 'object' && item !== null) {
        if (item instanceof Date) return item;

        const newItem = { ...item };
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

// ---------------------------------------------------------------------------
// Dynamic Import of Persona Data (Vite Feature)
// ---------------------------------------------------------------------------
const personaMessagesModules = import.meta.glob('@/data/personas/*/messages.json', { eager: true });
const personaApprovalsModules = import.meta.glob('@/data/personas/*/approvals.json', { eager: true });
const personaSchedulesModules = import.meta.glob('@/data/personas/*/schedules.json', { eager: true });
const personaNotificationsModules = import.meta.glob('@/data/personas/*/notifications.json', { eager: true });
const personaInspectionsModules = import.meta.glob('@/data/personas/*/inspections.json', { eager: true });

// Extract Persona Data
const PERSONA_MESSAGES = Object.values(personaMessagesModules).flatMap((mod: any) => parseDates<Message>(mod.default || mod));
const PERSONA_APPROVALS = Object.values(personaApprovalsModules).flatMap((mod: any) => parseDates<ApprovalDocument>(mod.default || mod));
const PERSONA_SCHEDULES = Object.values(personaSchedulesModules).flatMap((mod: any) => parseDates<Schedule>(mod.default || mod));
const PERSONA_INSPECTIONS = Object.values(personaInspectionsModules).flatMap((mod: any) => parseDates<InspectionRequest>(mod.default || mod));

// Special handling for Notifications to attach target persona info (deduced from path)
const PERSONA_NOTIFICATIONS = Object.entries(personaNotificationsModules).flatMap(([path, mod]: [string, any]) => {
    // Path example: /src/data/personas/solum/notifications.json
    const parts = path.split('/');
    const personaIndex = parts.indexOf('personas') + 1;
    const personaKey = parts[personaIndex]; // 'solum'

    const data = mod.default || mod;
    return parseDates<Notification[]>(data).map((n: any) => ({
        ...n,
        _targetPersona: personaKey // Internal tag for filtering
    }));
});
// ---------------------------------------------------------------------------

const ALL_INCIDENTS = parseDates<Incident>(SHARED_INCIDENTS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];
const GLOBAL_MANUALS = parseDates<Manual>(GLOBAL_MANUALS_JSON);

// Aggregate All Data
const ALL_MESSAGES = [
    ...parseDates<Message>(GLOBAL_MESSAGES_JSON),
    ...parseDates<Message>(ORDINARY_MESSAGES_JSON || []),
    ...PERSONA_MESSAGES
];

const ALL_APPROVALS = [
    ...parseDates<ApprovalDocument>(GLOBAL_APPROVALS_JSON),
    ...parseDates<ApprovalDocument>(SEGWANG_APPROVALS_JSON),
    ...parseDates<ApprovalDocument>(ORDINARY_APPROVALS_JSON || []),
    ...PERSONA_APPROVALS
];

const ALL_SCHEDULES = [
    ...parseDates<Schedule>(GLOBAL_SCHEDULES_JSON),
    ...parseDates<Schedule>(SEGWANG_SCHEDULES_JSON),
    ...parseDates<Schedule>(ORDINARY_SCHEDULES_JSON || []),
    ...PERSONA_SCHEDULES
];

const ALL_INSPECTIONS = [
    ...parseDates<InspectionRequest>(ORDINARY_INSPECTIONS_JSON || []),
    ...PERSONA_INSPECTIONS
];

const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);

export const DataManager = {
    // Incidents: Unified
    getIncidents: (agent: Agent | null, context?: 'segwang') => {
        if (context === 'segwang') {
            return parseDates<Incident>(SEGWANG_INCIDENTS_JSON);
        }
        return ALL_INCIDENTS;
    },

    // Messages: Centralized with Filtering
    getMessages: (agent: Agent | null) => {
        if (!agent) return ALL_MESSAGES.filter((m: any) => !m.receiverId || m.receiverId === 'all');

        return ALL_MESSAGES.filter((msg: Message) =>
            msg.receiverId === agent.id || // Exact ID match
            msg.receiverId === agent.personaKey || // Key match (e.g. 'solum')
            msg.receiverId === agent.codename || // Codename match
            msg.senderId === agent.id ||
            msg.senderId === agent.personaKey
        ).filter((msg, index, self) =>
            index === self.findIndex((t) => t.id === msg.id)
        ).sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    // Notifications: Global + Personal
    getNotifications: (agent: Agent | null) => {
        if (!agent) return GLOBAL_NOTIFICATIONS;

        const myPersonaNotices = PERSONA_NOTIFICATIONS.filter((n: any) =>
            n._targetPersona === agent.personaKey || n._targetPersona === agent.id
        );

        // Remove duplicates if any (though unlikely between global and persona)
        return [...GLOBAL_NOTIFICATIONS, ...myPersonaNotices]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    // Approvals: Centralized with Filtering
    getApprovals: (agent: Agent | null) => {
        if (!agent) return [];
        return ALL_APPROVALS.filter((doc: ApprovalDocument) =>
            doc.createdBy === agent.id ||
            doc.createdBy === agent.personaKey ||
            doc.approver === agent.id ||
            doc.approver === agent.personaKey
        );
    },

    // Schedules: Centralized with Filtering
    getSchedules: (agent: Agent | null) => {
        if (!agent) return [];
        return ALL_SCHEDULES.filter((s: Schedule) =>
            !s.agentId ||
            s.agentId === agent.id ||
            s.agentId === agent.personaKey
        );
    },

    // Equipment: Global only
    getEquipment: () => GLOBAL_EQUIPMENT,

    // Locations: Global only
    getLocations: () => GLOBAL_LOCATIONS,

    // Manuals: Global only
    getManuals: () => GLOBAL_MANUALS,

    getManual: (id: string) => GLOBAL_MANUALS.find((m: Manual) => m.id === id),

    _statsCache: null as ReturnType<typeof DataManager.getStats> | null,
    _statsCacheTime: 0,

    getStats: () => {
        const now = Date.now();
        const CACHE_DURATION = 60000;

        if (DataManager._statsCache && (now - DataManager._statsCacheTime) < CACHE_DURATION) {
            return DataManager._statsCache;
        }

        const allIncidents = ALL_INCIDENTS;
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const thisMonthIncidents = allIncidents.filter((inc: any) =>
            new Date(inc.createdAt) >= monthStart
        );

        const stats = {
            baekho: {
                received: thisMonthIncidents.filter((inc: any) => inc.status === '접수').length,
                investigating: allIncidents.filter((inc: any) => inc.status === '조사중').length,
                completed: allIncidents.filter((inc: any) =>
                    inc.status !== '접수' && inc.status !== '조사중'
                ).length,
            },
            hyunmu: {
                requests: thisMonthIncidents.filter((inc: any) =>
                    inc.status === '구조대기' || inc.status === '구조중'
                ).length,
                rescuing: allIncidents.filter((inc: any) => inc.status === '구조중').length,
                completed: allIncidents.filter((inc: any) =>
                    inc.status === '정리대기' || inc.status === '정리중' || inc.status === '종결' || inc.status === '봉인'
                ).length,
            },
            jujak: {
                requests: thisMonthIncidents.filter((inc: any) =>
                    inc.status === '정리대기' || inc.status === '정리중'
                ).length,
                cleaning: allIncidents.filter((inc: any) => inc.status === '정리중').length,
                completed: allIncidents.filter((inc: any) => inc.status === '종결' || inc.status === '봉인').length,
            },
        };

        DataManager._statsCache = stats;
        DataManager._statsCacheTime = now;

        return stats;
    },

    getInspectionRequests: (agent: Agent | null): InspectionRequest[] => {
        if (!agent) return [];
        return ALL_INSPECTIONS.filter((req: InspectionRequest) => req.agentId === agent.id || req.agentId === agent.personaKey);
    }
};
