import { Agent, Incident, Notification, Schedule, ApprovalDocument, Message, InspectionRequest, Manual } from '@/types/haetae';
import { VisitLocation, Equipment } from '@/types/haetae';

import { INTERACTION_MESSAGES, TriggerSystem } from '@/data/interactions';

// Import Global JSON Data
import GLOBAL_NOTIFICATIONS_JSON from './global/notifications.json';
import GLOBAL_EQUIPMENT_JSON from './global/equipment.json';
import GLOBAL_LOCATIONS_JSON from './global/locations.json';
import GLOBAL_INCIDENTS_JSON from './global/incidents.json';
import GLOBAL_MANUALS_JSON from './global/manuals.json';

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
        if (newItem.lastUpdated) newItem.lastUpdated = new Date(newItem.lastUpdated);
        return newItem as T;
    });
};

// Processed Data
const GLOBAL_INCIDENTS = parseDates<Incident>(GLOBAL_INCIDENTS_JSON);
const GLOBAL_NOTIFICATIONS = parseDates<Notification>(GLOBAL_NOTIFICATIONS_JSON);
const GLOBAL_EQUIPMENT = GLOBAL_EQUIPMENT_JSON as Equipment[];
const GLOBAL_LOCATIONS = GLOBAL_LOCATIONS_JSON as VisitLocation[];
const GLOBAL_MANUALS = parseDates<Manual>(GLOBAL_MANUALS_JSON);

const ORDINARY_DATA = {
    incidents: parseDates<Incident>(ORDINARY_INCIDENTS_JSON),
    messages: parseDates<Message>(ORDINARY_MESSAGES_JSON),
    approvals: parseDates<ApprovalDocument>(ORDINARY_APPROVALS_JSON),
    schedules: parseDates<Schedule>(ORDINARY_SCHEDULES_JSON),
};

const PERSONA_MAP: Record<string, {
    incidents: Incident[];
    messages: Message[];
    notifications: Notification[];
    approvals: ApprovalDocument[];
    schedules: Schedule[];
}> = {
    '박홍림': {
        incidents: parseDates<Incident>(PARKHONGLIM_INCIDENTS_JSON),
        messages: parseDates<Message>(PARKHONGLIM_MESSAGES_JSON),
        notifications: parseDates<Notification>(PARKHONGLIM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(PARKHONGLIM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(PARKHONGLIM_SCHEDULES_JSON),
    },
    '최요원': {
        incidents: parseDates<Incident>(CHOIYOWON_INCIDENTS_JSON),
        messages: parseDates<Message>(CHOIYOWON_MESSAGES_JSON),
        notifications: parseDates<Notification>(CHOIYOWON_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(CHOIYOWON_APPROVALS_JSON),
        schedules: parseDates<Schedule>(CHOIYOWON_SCHEDULES_JSON),
    },
    '류재관': {
        incidents: parseDates<Incident>(RYUJAEGWAN_INCIDENTS_JSON),
        messages: parseDates<Message>(RYUJAEGWAN_MESSAGES_JSON),
        notifications: parseDates<Notification>(RYUJAEGWAN_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(RYUJAEGWAN_APPROVALS_JSON),
        schedules: parseDates<Schedule>(RYUJAEGWAN_SCHEDULES_JSON),
    },
    '김솔음': {
        incidents: parseDates<Incident>(SOLUM_INCIDENTS_JSON),
        messages: parseDates<Message>(SOLUM_MESSAGES_JSON),
        notifications: parseDates<Notification>(SOLUM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(SOLUM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(SOLUM_SCHEDULES_JSON),
    },
    '해금': {
        incidents: parseDates<Incident>(HAEGEUM_INCIDENTS_JSON),
        messages: parseDates<Message>(HAEGEUM_MESSAGES_JSON),
        notifications: parseDates<Notification>(HAEGEUM_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(HAEGEUM_APPROVALS_JSON),
        schedules: parseDates<Schedule>(HAEGEUM_SCHEDULES_JSON),
    },
    '고영은': {
        incidents: parseDates<Incident>(KOYOUNGEUN_INCIDENTS_JSON),
        messages: parseDates<Message>(KOYOUNGEUN_MESSAGES_JSON),
        notifications: parseDates<Notification>(KOYOUNGEUN_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(KOYOUNGEUN_APPROVALS_JSON),
        schedules: parseDates<Schedule>(KOYOUNGEUN_SCHEDULES_JSON),
    },
    '장허운': {
        incidents: parseDates<Incident>(JANGHYEOWOON_INCIDENTS_JSON),
        messages: parseDates<Message>(JANGHYEOWOON_MESSAGES_JSON),
        notifications: parseDates<Notification>(JANGHYEOWOON_NOTIFICATIONS_JSON),
        approvals: parseDates<ApprovalDocument>(JANGHYEOWOON_APPROVALS_JSON),
        schedules: parseDates<Schedule>(JANGHYEOWOON_SCHEDULES_JSON),
    },
};

export const DataManager = {
    // Incidents: Global base + Persona/Ordinary additional incidents
    getIncidents: (agent: Agent | null) => {
        const global = GLOBAL_INCIDENTS;
        if (!agent) return [...ORDINARY_DATA.incidents, ...global];
        const personaData = PERSONA_MAP[agent.name];
        return [...(personaData?.incidents || ORDINARY_DATA.incidents), ...global];
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

    getStats: () => {
        // Use all incidents from all sources for stats calculation
        const allIncidents = [
            ...GLOBAL_INCIDENTS,
            ...ORDINARY_DATA.incidents,
            ...Object.values(PERSONA_MAP).flatMap(d => d.incidents)
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

    // Inspection Requests (Mock Data for now)
    getInspectionRequests: (agent: Agent | null): InspectionRequest[] => {
        if (!agent) return [];

        // Mock data for demo
        const requests: InspectionRequest[] = [
            {
                id: 'insp-001',
                agentId: agent.id,
                type: '정기검사',
                status: '완료',
                scheduledDate: new Date('2024-12-01T10:00:00'),
                result: '정상 (오염도 5%)',
                createdAt: new Date('2024-11-25')
            }
        ];

        // Agent Choi gets more inspections
        if (agent.name === '최요원') {
            requests.push(
                {
                    id: 'insp-002',
                    agentId: agent.id,
                    type: '정밀검사',
                    status: '완료',
                    scheduledDate: new Date('2024-12-15T14:00:00'),
                    symptoms: '지속적인 두통 및 환청',
                    result: '경미한 정신 오염 확인, 정화 치료 요망',
                    createdAt: new Date('2024-12-10')
                },
                {
                    id: 'insp-003',
                    agentId: agent.id,
                    type: '정기검사',
                    status: '접수',
                    scheduledDate: new Date('2025-01-05T09:00:00'),
                    createdAt: new Date('2024-12-28')
                }
            );
        }

        return requests.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
    }
};
