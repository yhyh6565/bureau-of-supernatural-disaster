import { Agent, Incident, Notification, Schedule, ApprovalDocument, Message } from '@/types/haetae';
import { VisitLocation, Equipment } from '@/types/haetae';

import { INTERACTION_MESSAGES, TriggerSystem } from '@/data/interactions';

// Import Global JSON Data
import GLOBAL_NOTIFICATIONS_JSON from './global/notifications.json';
import GLOBAL_EQUIPMENT_JSON from './global/equipment.json';
import GLOBAL_LOCATIONS_JSON from './global/locations.json';
import GLOBAL_INCIDENTS_JSON from './global/incidents.json';

// Import Ordinary JSON Data
import ORDINARY_MESSAGES_JSON from './ordinary/messages.json';
import ORDINARY_APPROVALS_JSON from './ordinary/approvals.json';
import ORDINARY_SCHEDULES_JSON from './ordinary/schedules.json';
import ORDINARY_INCIDENTS_JSON from './ordinary/incidents.json';

// Import Persona JSON Data
import PARKHONGLIM_INCIDENTS_JSON from './personas/parkhonglim/incidents.json';
import PARKHONGLIM_MESSAGES_JSON from './personas/parkhonglim/messages.json';
import PARKHONGLIM_NOTIFICATIONS_JSON from './personas/parkhonglim/notifications.json';
import PARKHONGLIM_APPROVALS_JSON from './personas/parkhonglim/approvals.json';
import PARKHONGLIM_SCHEDULES_JSON from './personas/parkhonglim/schedules.json';

import CHOIYOWON_INCIDENTS_JSON from './personas/choiyowon/incidents.json';
import CHOIYOWON_MESSAGES_JSON from './personas/choiyowon/messages.json';
import CHOIYOWON_NOTIFICATIONS_JSON from './personas/choiyowon/notifications.json';
import CHOIYOWON_APPROVALS_JSON from './personas/choiyowon/approvals.json';
import CHOIYOWON_SCHEDULES_JSON from './personas/choiyowon/schedules.json';

import RYUJAEGWAN_INCIDENTS_JSON from './personas/ryujaegwan/incidents.json';
import RYUJAEGWAN_MESSAGES_JSON from './personas/ryujaegwan/messages.json';
import RYUJAEGWAN_NOTIFICATIONS_JSON from './personas/ryujaegwan/notifications.json';
import RYUJAEGWAN_APPROVALS_JSON from './personas/ryujaegwan/approvals.json';
import RYUJAEGWAN_SCHEDULES_JSON from './personas/ryujaegwan/schedules.json';

import SOLUM_INCIDENTS_JSON from './personas/solum/incidents.json';
import SOLUM_MESSAGES_JSON from './personas/solum/messages.json';
import SOLUM_NOTIFICATIONS_JSON from './personas/solum/notifications.json';
import SOLUM_APPROVALS_JSON from './personas/solum/approvals.json';
import SOLUM_SCHEDULES_JSON from './personas/solum/schedules.json';

import HAEGEUM_INCIDENTS_JSON from './personas/haegeum/incidents.json';
import HAEGEUM_MESSAGES_JSON from './personas/haegeum/messages.json';
import HAEGEUM_NOTIFICATIONS_JSON from './personas/haegeum/notifications.json';
import HAEGEUM_APPROVALS_JSON from './personas/haegeum/approvals.json';
import HAEGEUM_SCHEDULES_JSON from './personas/haegeum/schedules.json';

import KOYOUNGEUN_INCIDENTS_JSON from './personas/koyoungeun/incidents.json';
import KOYOUNGEUN_MESSAGES_JSON from './personas/koyoungeun/messages.json';
import KOYOUNGEUN_NOTIFICATIONS_JSON from './personas/koyoungeun/notifications.json';
import KOYOUNGEUN_APPROVALS_JSON from './personas/koyoungeun/approvals.json';
import KOYOUNGEUN_SCHEDULES_JSON from './personas/koyoungeun/schedules.json';

import JANGHYEOWOON_INCIDENTS_JSON from './personas/janghyeowoon/incidents.json';
import JANGHYEOWOON_MESSAGES_JSON from './personas/janghyeowoon/messages.json';
import JANGHYEOWOON_NOTIFICATIONS_JSON from './personas/janghyeowoon/notifications.json';
import JANGHYEOWOON_APPROVALS_JSON from './personas/janghyeowoon/approvals.json';
import JANGHYEOWOON_SCHEDULES_JSON from './personas/janghyeowoon/schedules.json';

// Helper to revive dates from JSON
const parseDates = <T>(items: any[]): T[] => {
    return items.map(item => {
        const newItem = { ...item };
        if (newItem.createdAt) newItem.createdAt = new Date(newItem.createdAt);
        if (newItem.updatedAt) newItem.updatedAt = new Date(newItem.updatedAt);
        if (newItem.processedAt) newItem.processedAt = new Date(newItem.processedAt);
        if (newItem.date) newItem.date = new Date(newItem.date);
        return newItem as T;
    });
};

// Processed Data
const GLOBAL_INCIDENTS = parseDates<Incident>(GLOBAL_INCIDENTS_JSON);
const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];

const ORDINARY_INCIDENTS = parseDates<Incident>(ORDINARY_INCIDENTS_JSON);
const ORDINARY_MESSAGES = parseDates<Message>(ORDINARY_MESSAGES_JSON);
const ORDINARY_APPROVALS = parseDates<ApprovalDocument>(ORDINARY_APPROVALS_JSON);
const ORDINARY_SCHEDULES = parseDates<Schedule>(ORDINARY_SCHEDULES_JSON);

const PARKHONGLIM_INCIDENTS = parseDates<Incident>(PARKHONGLIM_INCIDENTS_JSON);
const PARKHONGLIM_MESSAGES = parseDates<Message>(PARKHONGLIM_MESSAGES_JSON);
const PARKHONGLIM_NOTIFICATIONS = parseDates<Notification>(PARKHONGLIM_NOTIFICATIONS_JSON);
const PARKHONGLIM_APPROVALS = parseDates<ApprovalDocument>(PARKHONGLIM_APPROVALS_JSON);
const PARKHONGLIM_SCHEDULES = parseDates<Schedule>(PARKHONGLIM_SCHEDULES_JSON);

const CHOIYOWON_INCIDENTS = parseDates<Incident>(CHOIYOWON_INCIDENTS_JSON);
const CHOIYOWON_MESSAGES = parseDates<Message>(CHOIYOWON_MESSAGES_JSON);
const CHOIYOWON_NOTIFICATIONS = parseDates<Notification>(CHOIYOWON_NOTIFICATIONS_JSON);
const CHOIYOWON_APPROVALS = parseDates<ApprovalDocument>(CHOIYOWON_APPROVALS_JSON);
const CHOIYOWON_SCHEDULES = parseDates<Schedule>(CHOIYOWON_SCHEDULES_JSON);

const RYUJAEGWAN_INCIDENTS = parseDates<Incident>(RYUJAEGWAN_INCIDENTS_JSON);
const RYUJAEGWAN_MESSAGES = parseDates<Message>(RYUJAEGWAN_MESSAGES_JSON);
const RYUJAEGWAN_NOTIFICATIONS = parseDates<Notification>(RYUJAEGWAN_NOTIFICATIONS_JSON);
const RYUJAEGWAN_APPROVALS = parseDates<ApprovalDocument>(RYUJAEGWAN_APPROVALS_JSON);
const RYUJAEGWAN_SCHEDULES = parseDates<Schedule>(RYUJAEGWAN_SCHEDULES_JSON);

const SOLUM_INCIDENTS = parseDates<Incident>(SOLUM_INCIDENTS_JSON);
const SOLUM_MESSAGES = parseDates<Message>(SOLUM_MESSAGES_JSON);
const SOLUM_NOTIFICATIONS = parseDates<Notification>(SOLUM_NOTIFICATIONS_JSON);
const SOLUM_APPROVALS = parseDates<ApprovalDocument>(SOLUM_APPROVALS_JSON);
const SOLUM_SCHEDULES = parseDates<Schedule>(SOLUM_SCHEDULES_JSON);

const HAEGEUM_INCIDENTS = parseDates<Incident>(HAEGEUM_INCIDENTS_JSON);
const HAEGEUM_MESSAGES = parseDates<Message>(HAEGEUM_MESSAGES_JSON);
const HAEGEUM_NOTIFICATIONS = parseDates<Notification>(HAEGEUM_NOTIFICATIONS_JSON);
const HAEGEUM_APPROVALS = parseDates<ApprovalDocument>(HAEGEUM_APPROVALS_JSON);
const HAEGEUM_SCHEDULES = parseDates<Schedule>(HAEGEUM_SCHEDULES_JSON);

const KOYOUNGEUN_INCIDENTS = parseDates<Incident>(KOYOUNGEUN_INCIDENTS_JSON);
const KOYOUNGEUN_MESSAGES = parseDates<Message>(KOYOUNGEUN_MESSAGES_JSON);
const KOYOUNGEUN_NOTIFICATIONS = parseDates<Notification>(KOYOUNGEUN_NOTIFICATIONS_JSON);
const KOYOUNGEUN_APPROVALS = parseDates<ApprovalDocument>(KOYOUNGEUN_APPROVALS_JSON);
const KOYOUNGEUN_SCHEDULES = parseDates<Schedule>(KOYOUNGEUN_SCHEDULES_JSON);

const JANGHYEOWOON_INCIDENTS = parseDates<Incident>(JANGHYEOWOON_INCIDENTS_JSON);
const JANGHYEOWOON_MESSAGES = parseDates<Message>(JANGHYEOWOON_MESSAGES_JSON);
const JANGHYEOWOON_NOTIFICATIONS = parseDates<Notification>(JANGHYEOWOON_NOTIFICATIONS_JSON);
const JANGHYEOWOON_APPROVALS = parseDates<ApprovalDocument>(JANGHYEOWOON_APPROVALS_JSON);
const JANGHYEOWOON_SCHEDULES = parseDates<Schedule>(JANGHYEOWOON_SCHEDULES_JSON);

export const DataManager = {
    // Incidents: Global base + Persona/Ordinary additional incidents
    getIncidents: (agent: Agent | null) => {
        const global = GLOBAL_INCIDENTS;

        if (!agent) return [...ORDINARY_INCIDENTS, ...global];

        switch (agent.name) {
            case '박홍림': return [...PARKHONGLIM_INCIDENTS, ...global];
            case '최요원': return [...CHOIYOWON_INCIDENTS, ...global];
            case '류재관': return [...RYUJAEGWAN_INCIDENTS, ...global];
            case '김솔음': return [...SOLUM_INCIDENTS, ...global];
            case '해금': return [...HAEGEUM_INCIDENTS, ...global];
            case '고영은': return [...KOYOUNGEUN_INCIDENTS, ...global];
            case '장허운': return [...JANGHYEOWOON_INCIDENTS, ...global];
            default: return [...ORDINARY_INCIDENTS, ...global];
        }
    },

    // Messages: Personal data only (no global)
    getMessages: (agent: Agent | null) => {
        if (!agent) return ORDINARY_MESSAGES;

        switch (agent.name) {
            case '박홍림': return PARKHONGLIM_MESSAGES;
            case '최요원': return CHOIYOWON_MESSAGES;
            case '류재관': return RYUJAEGWAN_MESSAGES;
            case '김솔음': return SOLUM_MESSAGES;
            case '해금': return HAEGEUM_MESSAGES;
            case '고영은': return KOYOUNGEUN_MESSAGES;
            case '장허운': return JANGHYEOWOON_MESSAGES;
            default: return ORDINARY_MESSAGES;
        }
    },

    // Notifications: Global base + Persona personal notifications
    getNotifications: (agent: Agent | null) => {
        const global = GLOBAL_NOTIFICATIONS;

        if (!agent) return global;

        switch (agent.name) {
            case '박홍림': return [...PARKHONGLIM_NOTIFICATIONS, ...global];
            case '최요원': return [...CHOIYOWON_NOTIFICATIONS, ...global];
            case '류재관': return [...RYUJAEGWAN_NOTIFICATIONS, ...global];
            case '김솔음': return [...SOLUM_NOTIFICATIONS, ...global];
            case '해금': return [...HAEGEUM_NOTIFICATIONS, ...global];
            case '고영은': return [...KOYOUNGEUN_NOTIFICATIONS, ...global];
            case '장허운': return [...JANGHYEOWOON_NOTIFICATIONS, ...global];
            default: return global;
        }
    },

    // Approvals: Personal data only (no global)
    getApprovals: (agent: Agent | null) => {
        if (!agent) return ORDINARY_APPROVALS;

        switch (agent.name) {
            case '박홍림': return PARKHONGLIM_APPROVALS;
            case '최요원': return CHOIYOWON_APPROVALS;
            case '류재관': return RYUJAEGWAN_APPROVALS;
            case '김솔음': return SOLUM_APPROVALS;
            case '해금': return HAEGEUM_APPROVALS;
            case '고영은': return KOYOUNGEUN_APPROVALS;
            case '장허운': return JANGHYEOWOON_APPROVALS;
            default: return ORDINARY_APPROVALS;
        }
    },

    // Schedules: Personal data only (no global)
    getSchedules: (agent: Agent | null) => {
        if (!agent) return ORDINARY_SCHEDULES;

        switch (agent.name) {
            case '박홍림': return PARKHONGLIM_SCHEDULES;
            case '최요원': return CHOIYOWON_SCHEDULES;
            case '류재관': return RYUJAEGWAN_SCHEDULES;
            case '김솔음': return SOLUM_SCHEDULES;
            case '해금': return HAEGEUM_SCHEDULES;
            case '고영은': return KOYOUNGEUN_SCHEDULES;
            case '장허운': return JANGHYEOWOON_SCHEDULES;
            default: return ORDINARY_SCHEDULES;
        }
    },

    // Equipment: Global only (same for everyone)
    getEquipment: () => GLOBAL_EQUIPMENT,

    // Locations: Global only (same for everyone)
    getLocations: () => GLOBAL_LOCATIONS,

    getStats: () => {
        // Use all incidents from all sources for stats calculation
        const allIncidents = [
            ...GLOBAL_INCIDENTS,
            ...PARKHONGLIM_INCIDENTS,
            ...CHOIYOWON_INCIDENTS,
            ...RYUJAEGWAN_INCIDENTS,
            ...SOLUM_INCIDENTS,
            ...HAEGEUM_INCIDENTS,
            ...KOYOUNGEUN_INCIDENTS,
            ...JANGHYEOWOON_INCIDENTS,
            ...ORDINARY_INCIDENTS,
        ];

        // Get current month start date
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter incidents created this month
        const thisMonthIncidents = allIncidents.filter(inc =>
            new Date(inc.createdAt) >= monthStart
        );

        return {
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
                    inc.status === '정리대기' || inc.status === '정리중' || inc.status === '종결'
                ).length,
            },
            jujak: {
                requests: thisMonthIncidents.filter(inc =>
                    inc.status === '정리대기' || inc.status === '정리중'
                ).length,
                cleaning: allIncidents.filter(inc => inc.status === '정리중').length,
                completed: allIncidents.filter(inc => inc.status === '종결').length,
            },
        };
    },
};
