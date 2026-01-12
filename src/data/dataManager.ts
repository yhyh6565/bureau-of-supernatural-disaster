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
import SEGWANG_MESSAGES_JSON from '@/data/segwang/messages.json'; // messages.json might not exist if source csv handled differently, verify logic. Script generates if CSV exists.
// Wait, step 2036 output said "Ordinary_messages.csv -> messages.json".
// Did Segwang have messages? No, step 2036 only listed "Segwang_approvals.csv -> approvals.json", "Segwang_schedules.csv -> schedules.json".
// Segwang messages might not exist. I should check existence or use empty array if import fails? No, static import will fail.
// I will assume only existing files should be imported.
// Segwang messages are NOT in build script output (step 2024 buildSegwang function).
// So no SEGWANG_MESSAGES.

import SEGWANG_APPROVALS_JSON from '@/data/segwang/approvals.json';
import SEGWANG_SCHEDULES_JSON from '@/data/segwang/schedules.json';

// Import Ordinary Data
import ORDINARY_MESSAGES_JSON from '@/data/ordinary/messages.json';
import ORDINARY_APPROVALS_JSON from '@/data/ordinary/approvals.json';
import ORDINARY_SCHEDULES_JSON from '@/data/ordinary/schedules.json';
import ORDINARY_INSPECTIONS_JSON from '@/data/ordinary/inspections.json';


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

const ALL_INCIDENTS = parseDates<Incident>(SHARED_INCIDENTS_JSON);
const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];
const GLOBAL_MANUALS = parseDates<Manual>(GLOBAL_MANUALS_JSON);

// Aggregate Messages
const ALL_MESSAGES = [
    ...parseDates<Message>(GLOBAL_MESSAGES_JSON),
    ...parseDates<Message>(ORDINARY_MESSAGES_JSON || [])
];

// Aggregate Approvals
const ALL_APPROVALS = [
    ...parseDates<ApprovalDocument>(GLOBAL_APPROVALS_JSON),
    ...parseDates<ApprovalDocument>(SEGWANG_APPROVALS_JSON),
    ...parseDates<ApprovalDocument>(ORDINARY_APPROVALS_JSON || [])
];

// Aggregate Schedules
const ALL_SCHEDULES = [
    ...parseDates<Schedule>(GLOBAL_SCHEDULES_JSON),
    ...parseDates<Schedule>(SEGWANG_SCHEDULES_JSON),
    ...parseDates<Schedule>(ORDINARY_SCHEDULES_JSON || [])
];

// Aggregate Inspections (Global + Ordinary) - Global/inspections.json didn't exist in script?
// Step 2024 buildGlobal list: approvals, messages, notifications, schedules, manuals. No inspections.
// So GLOBAL_INSPECTIONS_JSON from original code is invalid if not generated?
// Original: import GLOBAL_INSPECTIONS_JSON from '@/data/global/inspections.json';
// Script 2024: No Global_inspections.csv processing.
// So inspections only valid for Ordinary or Persona.
const ALL_INSPECTIONS = parseDates<InspectionRequest>(ORDINARY_INSPECTIONS_JSON || []);


export const DataManager = {
    // Incidents: Unified
    getIncidents: (agent: Agent | null) => {
        return ALL_INCIDENTS;
    },

    // Messages: Centralized with Filtering
    getMessages: (agent: Agent | null) => {
        if (!agent) return ALL_MESSAGES.filter((m: any) => !m.receiverId || m.receiverId === 'all'); // Fallback for no agent

        // Get messages where I am the receiver OR I am the sender
        return ALL_MESSAGES.filter((msg: Message) =>
            msg.receiverId === agent.id ||
            msg.receiverId === agent.personaKey ||
            msg.senderId === agent.id ||
            msg.senderId === agent.personaKey
        ).sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    // Notifications: Global + Personal filtering (if we add targetId to notifications later)
    getNotifications: (agent: Agent | null) => {
        return GLOBAL_NOTIFICATIONS;
    },

    // Approvals: Centralized with Filtering
    getApprovals: (agent: Agent | null) => {
        if (!agent) return [];
        // Show approvals created by me OR approvals where I am the approver
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
        // Filter schedules for this agent
        return ALL_SCHEDULES.filter((s: Schedule) => !s.agentId || s.agentId === agent.id || s.agentId === agent.personaKey);
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

        // Use ALL_INCIDENTS for consistent stats
        const allIncidents = ALL_INCIDENTS;

        // Get current month start date
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Filter incidents created this month
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

        // 캐시 저장
        DataManager._statsCache = stats;
        DataManager._statsCacheTime = now;

        return stats;
    },

    // Inspection Requests
    getInspectionRequests: (agent: Agent | null): InspectionRequest[] => {
        if (!agent) return [];
        return ALL_INSPECTIONS.filter((req: InspectionRequest) => req.agentId === agent.id || req.agentId === agent.personaKey);
    }
};
