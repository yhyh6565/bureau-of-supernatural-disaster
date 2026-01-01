import { Agent } from '@/types/haetae';

// Import Global Data (same for all users)
import { GLOBAL_NOTIFICATIONS } from './global/notifications';
import { GLOBAL_EQUIPMENT } from './global/equipment';
import { GLOBAL_LOCATIONS } from './global/locations';
import { GLOBAL_INCIDENTS } from './global/incidents';

// Import Ordinary User Data
import { ORDINARY_MESSAGES } from './ordinary/messages';
import { ORDINARY_APPROVALS } from './ordinary/approvals';
import { ORDINARY_SCHEDULES } from './ordinary/schedules';
import { ORDINARY_INCIDENTS } from './ordinary/incidents';

// Import Persona Data - 박홍림
import { PARKHONGLIM_INCIDENTS } from './personas/parkhonglim/incidents';
import { PARKHONGLIM_MESSAGES } from './personas/parkhonglim/messages';
import { PARKHONGLIM_NOTIFICATIONS } from './personas/parkhonglim/notifications';
import { PARKHONGLIM_APPROVALS } from './personas/parkhonglim/approvals';
import { PARKHONGLIM_SCHEDULES } from './personas/parkhonglim/schedules';

// Import Persona Data - 최요원
import { CHOIYOWON_INCIDENTS } from './personas/choiyowon/incidents';
import { CHOIYOWON_MESSAGES } from './personas/choiyowon/messages';
import { CHOIYOWON_NOTIFICATIONS } from './personas/choiyowon/notifications';
import { CHOIYOWON_APPROVALS } from './personas/choiyowon/approvals';
import { CHOIYOWON_SCHEDULES } from './personas/choiyowon/schedules';

// Import Persona Data - 류재관
import { RYUJAEGWAN_INCIDENTS } from './personas/ryujaegwan/incidents';
import { RYUJAEGWAN_MESSAGES } from './personas/ryujaegwan/messages';
import { RYUJAEGWAN_NOTIFICATIONS } from './personas/ryujaegwan/notifications';
import { RYUJAEGWAN_APPROVALS } from './personas/ryujaegwan/approvals';
import { RYUJAEGWAN_SCHEDULES } from './personas/ryujaegwan/schedules';

// Import Persona Data - 김솔음
import { SOLUM_INCIDENTS } from './personas/solum/incidents';
import { SOLUM_MESSAGES } from './personas/solum/messages';
import { SOLUM_NOTIFICATIONS } from './personas/solum/notifications';
import { SOLUM_APPROVALS } from './personas/solum/approvals';
import { SOLUM_SCHEDULES } from './personas/solum/schedules';

// Import Persona Data - 해금
import { HAEGEUM_INCIDENTS } from './personas/haegeum/incidents';
import { HAEGEUM_MESSAGES } from './personas/haegeum/messages';
import { HAEGEUM_NOTIFICATIONS } from './personas/haegeum/notifications';
import { HAEGEUM_APPROVALS } from './personas/haegeum/approvals';
import { HAEGEUM_SCHEDULES } from './personas/haegeum/schedules';

// Import Persona Data - 고영은
import { KOYOUNGEUN_INCIDENTS } from './personas/koyoungeun/incidents';
import { KOYOUNGEUN_MESSAGES } from './personas/koyoungeun/messages';
import { KOYOUNGEUN_NOTIFICATIONS } from './personas/koyoungeun/notifications';
import { KOYOUNGEUN_APPROVALS } from './personas/koyoungeun/approvals';
import { KOYOUNGEUN_SCHEDULES } from './personas/koyoungeun/schedules';

// Import Persona Data - 장허운
import { JANGHYEOWOON_INCIDENTS } from './personas/janghyeowoon/incidents';
import { JANGHYEOWOON_MESSAGES } from './personas/janghyeowoon/messages';
import { JANGHYEOWOON_NOTIFICATIONS } from './personas/janghyeowoon/notifications';
import { JANGHYEOWOON_APPROVALS } from './personas/janghyeowoon/approvals';
import { JANGHYEOWOON_SCHEDULES } from './personas/janghyeowoon/schedules';

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
