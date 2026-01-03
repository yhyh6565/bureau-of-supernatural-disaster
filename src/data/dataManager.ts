import { Agent, Incident, Message, Notification, ApprovalDocument, Schedule, Equipment, VisitLocation, Manual, InspectionRequest } from '@/types/haetae';

// Import Global Data
import GLOBAL_INCIDENTS_JSON from '@/data/global/incidents.json';
import GLOBAL_NOTIFICATIONS_JSON from '@/data/global/notifications.json';
import GLOBAL_EQUIPMENT_JSON from '@/data/global/equipment.json';
import GLOBAL_LOCATIONS_JSON from '@/data/global/locations.json';
import GLOBAL_MANUALS_JSON from '@/data/global/manuals.json';

// Import Ordinary Data
import ORDINARY_MESSAGES_JSON from '@/data/ordinary/messages.json';
import ORDINARY_APPROVALS_JSON from '@/data/ordinary/approvals.json';
import ORDINARY_SCHEDULES_JSON from '@/data/ordinary/schedules.json';
import ORDINARY_INSPECTIONS_JSON from '@/data/ordinary/inspections.json';

// Import Persona Data (MESSAGES)
import PARKHONGLIM_MESSAGES_JSON from '@/data/personas/parkhonglim/messages.json';
import CHOIYOWON_MESSAGES_JSON from '@/data/personas/choiyowon/messages.json';
import RYUJAEGWAN_MESSAGES_JSON from '@/data/personas/ryujaegwan/messages.json';
import SOLUM_MESSAGES_JSON from '@/data/personas/solum/messages.json';
import HAEGEUM_MESSAGES_JSON from '@/data/personas/haegeum/messages.json';
import KOYOUNGEUN_MESSAGES_JSON from '@/data/personas/koyoungeun/messages.json';
import JANGHYEOWOON_MESSAGES_JSON from '@/data/personas/janghyeowoon/messages.json';

// Import Persona Data (NOTIFICATIONS)
import PARKHONGLIM_NOTIFICATIONS_JSON from '@/data/personas/parkhonglim/notifications.json';
import CHOIYOWON_NOTIFICATIONS_JSON from '@/data/personas/choiyowon/notifications.json';
import RYUJAEGWAN_NOTIFICATIONS_JSON from '@/data/personas/ryujaegwan/notifications.json';
import SOLUM_NOTIFICATIONS_JSON from '@/data/personas/solum/notifications.json';
import HAEGEUM_NOTIFICATIONS_JSON from '@/data/personas/haegeum/notifications.json';
import KOYOUNGEUN_NOTIFICATIONS_JSON from '@/data/personas/koyoungeun/notifications.json';
import JANGHYEOWOON_NOTIFICATIONS_JSON from '@/data/personas/janghyeowoon/notifications.json';

// Import Persona Data (APPROVALS)
import PARKHONGLIM_APPROVALS_JSON from '@/data/personas/parkhonglim/approvals.json';
import CHOIYOWON_APPROVALS_JSON from '@/data/personas/choiyowon/approvals.json';
import RYUJAEGWAN_APPROVALS_JSON from '@/data/personas/ryujaegwan/approvals.json';
import SOLUM_APPROVALS_JSON from '@/data/personas/solum/approvals.json';
import HAEGEUM_APPROVALS_JSON from '@/data/personas/haegeum/approvals.json';
import KOYOUNGEUN_APPROVALS_JSON from '@/data/personas/koyoungeun/approvals.json';
import JANGHYEOWOON_APPROVALS_JSON from '@/data/personas/janghyeowoon/approvals.json';

// Import Persona Data (SCHEDULES)
import PARKHONGLIM_SCHEDULES_JSON from '@/data/personas/parkhonglim/schedules.json';
import CHOIYOWON_SCHEDULES_JSON from '@/data/personas/choiyowon/schedules.json';
import RYUJAEGWAN_SCHEDULES_JSON from '@/data/personas/ryujaegwan/schedules.json';
import SOLUM_SCHEDULES_JSON from '@/data/personas/solum/schedules.json';
import HAEGEUM_SCHEDULES_JSON from '@/data/personas/haegeum/schedules.json';
import KOYOUNGEUN_SCHEDULES_JSON from '@/data/personas/koyoungeun/schedules.json';
import JANGHYEOWOON_SCHEDULES_JSON from '@/data/personas/janghyeowoon/schedules.json';

// Import Persona Data (INSPECTIONS)
import PARKHONGLIM_INSPECTIONS_JSON from '@/data/personas/parkhonglim/inspections.json';
import CHOIYOWON_INSPECTIONS_JSON from '@/data/personas/choiyowon/inspections.json';
import RYUJAEGWAN_INSPECTIONS_JSON from '@/data/personas/ryujaegwan/inspections.json';
import SOLUM_INSPECTIONS_JSON from '@/data/personas/solum/inspections.json';
import HAEGEUM_INSPECTIONS_JSON from '@/data/personas/haegeum/inspections.json';
import KOYOUNGEUN_INSPECTIONS_JSON from '@/data/personas/koyoungeun/inspections.json';
import JANGHYEOWOON_INSPECTIONS_JSON from '@/data/personas/janghyeowoon/inspections.json';

// Helper to parse dates in JSON data
function parseDates<T>(data: any[]): T[] {
    return data.map(item => {
        const newItem = { ...item };
        // Common Date fields
        if (newItem.createdAt) newItem.createdAt = new Date(newItem.createdAt);
        if (newItem.updatedAt) newItem.updatedAt = new Date(newItem.updatedAt);
        if (newItem.date) newItem.date = new Date(newItem.date);
        if (newItem.processedAt) newItem.processedAt = new Date(newItem.processedAt);
        if (newItem.lastUpdated) newItem.lastUpdated = new Date(newItem.lastUpdated);
        if (newItem.assignedAt) newItem.assignedAt = new Date(newItem.assignedAt);
        if (newItem.completedAt) newItem.completedAt = new Date(newItem.completedAt);
        if (newItem.scheduledDate) newItem.scheduledDate = new Date(newItem.scheduledDate);
        return newItem as T;
    });
}

const GLOBAL_INCIDENTS = parseDates<Incident>(GLOBAL_INCIDENTS_JSON);
const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];
const GLOBAL_MANUALS = parseDates<Manual>(GLOBAL_MANUALS_JSON);

const ORDINARY_DATA = {
    messages: parseDates<Message>(ORDINARY_MESSAGES_JSON),
    approvals: parseDates<ApprovalDocument>(ORDINARY_APPROVALS_JSON),
    schedules: parseDates<Schedule>(ORDINARY_SCHEDULES_JSON),
    inspections: parseDates<InspectionRequest>(ORDINARY_INSPECTIONS_JSON),
};

const PERSONA_MAP: Record<string, {
    messages: Message[];
    notifications: Notification[];
    approvals: ApprovalDocument[];
    schedules: Schedule[];
    inspections: InspectionRequest[];
}> = {
    '박홍림': {
        messages: parseDates<Message>(PARKHONGLIM_MESSAGES_JSON),
        notifications: parseDates<Notification>(PARKHONGLIM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(PARKHONGLIM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(PARKHONGLIM_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(PARKHONGLIM_INSPECTIONS_JSON),
    },
    '최요원': {
        messages: parseDates<Message>(CHOIYOWON_MESSAGES_JSON),
        notifications: parseDates<Notification>(CHOIYOWON_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(CHOIYOWON_APPROVALS_JSON),
        schedules: parseDates<Schedule>(CHOIYOWON_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(CHOIYOWON_INSPECTIONS_JSON),
    },
    '류재관': {
        messages: parseDates<Message>(RYUJAEGWAN_MESSAGES_JSON),
        notifications: parseDates<Notification>(RYUJAEGWAN_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(RYUJAEGWAN_APPROVALS_JSON),
        schedules: parseDates<Schedule>(RYUJAEGWAN_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(RYUJAEGWAN_INSPECTIONS_JSON),
    },
    '김솔음': {
        messages: parseDates<Message>(SOLUM_MESSAGES_JSON),
        notifications: parseDates<Notification>(SOLUM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(SOLUM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(SOLUM_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(SOLUM_INSPECTIONS_JSON),
    },
    '해금': {
        messages: parseDates<Message>(HAEGEUM_MESSAGES_JSON),
        notifications: parseDates<Notification>(HAEGEUM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(HAEGEUM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(HAEGEUM_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(HAEGEUM_INSPECTIONS_JSON),
    },
    '고영은': {
        messages: parseDates<Message>(KOYOUNGEUN_MESSAGES_JSON),
        notifications: parseDates<Notification>(KOYOUNGEUN_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(KOYOUNGEUN_APPROVALS_JSON),
        schedules: parseDates<Schedule>(KOYOUNGEUN_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(KOYOUNGEUN_INSPECTIONS_JSON),
    },
    '장허운': {
        messages: parseDates<Message>(JANGHYEOWOON_MESSAGES_JSON),
        notifications: parseDates<Notification>(JANGHYEOWOON_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(JANGHYEOWOON_APPROVALS_JSON),
        schedules: parseDates<Schedule>(JANGHYEOWOON_SCHEDULES_JSON),
        inspections: parseDates<InspectionRequest>(JANGHYEOWOON_INSPECTIONS_JSON),
    },
};

export const DataManager = {
    // Incidents: Global only (Unified)
    getIncidents: (agent: Agent | null) => {
        return GLOBAL_INCIDENTS;
    },

    // Messages: Personal data only (no global)
    getMessages: (agent: Agent | null) => {
        if (!agent) return ORDINARY_DATA.messages;
        return PERSONA_MAP[agent.name]?.messages || ORDINARY_DATA.messages;
    },

    // Notifications: Global base + Persona personal notifications
    getNotifications: (agent: Agent | null) => {
        const global = GLOBAL_NOTIFICATIONS;
        if (!agent) return global;
        const personaData = PERSONA_MAP[agent.name];
        return [...(personaData?.notifications || []), ...global];
    },

    // Approvals: Personal data only (no global)
    getApprovals: (agent: Agent | null) => {
        if (!agent) return ORDINARY_DATA.approvals;
        return PERSONA_MAP[agent.name]?.approvals || ORDINARY_DATA.approvals;
    },

    // Schedules: Personal data only (no global)
    getSchedules: (agent: Agent | null) => {
        if (!agent) return ORDINARY_DATA.schedules;
        return PERSONA_MAP[agent.name]?.schedules || ORDINARY_DATA.schedules;
    },

    // Equipment: Global only (same for everyone)
    getEquipment: () => GLOBAL_EQUIPMENT,

    // Locations: Global only (same for everyone)
    getLocations: () => GLOBAL_LOCATIONS,

    // Manuals: Global only
    getManuals: () => GLOBAL_MANUALS,

    getManual: (id: string) => GLOBAL_MANUALS.find(m => m.id === id),

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
        if (!agent) return ORDINARY_DATA.inspections;
        const personaData = PERSONA_MAP[agent.name];
        
        // Return persona data if exists, otherwise fallback to ordinary (optional, or just return empty)
        // Based on logic for other data, usage seems to favor exact match or fallback.
        // For inspections, if a persona has a specific file but it's empty [], we probably shouldn't fallback to ordinary mock data?
        // But ordinary data is mocked "Default" data.
        // Let's stick to consistent pattern: Persona Data OR Ordinary Data.
        return personaData?.inspections || ORDINARY_DATA.inspections;
        
        // Note: Sort is handled here if needed, or by consumer.
        // Let's add sort for consistency with previous mock logic.
        // return (personaData?.inspections || ORDINARY_DATA.inspections).slice().sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
    }
};
