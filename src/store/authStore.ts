import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Agent, Department } from '@/types/haetae';
import { AGENT_PROFILES, RANDOM_CODENAMES } from '@/constants/haetae';
import { useGameStore } from './gameStore';
import { useInteractionStore } from './interactionStore';
import { useWorkStore } from './workStore';

// Map by name for easy lookup
const AGENT_NAME_MAP: Record<string, Agent> = Object.values(AGENT_PROFILES).reduce((acc, agent) => {
    acc[agent.name] = agent;
    return acc;
}, {} as Record<string, Agent>);

interface AuthState {
    agent: Agent | null;
    isAuthenticated: boolean;
    login: (personaKey: string) => boolean;
    logout: () => void;
}

const createRandomAgent = (name: string): Agent => {
    const departments: Department[] = ['baekho', 'hyunmu', 'jujak'];
    const randomDept = departments[Math.floor(Math.random() * departments.length)];
    const randomTeamNum = Math.floor(Math.random() * 3) + 1; // 1~3팀
    const fixedRank = '실무관';
    const fixedGrade = 9;
    const randomCodename = RANDOM_CODENAMES[Math.floor(Math.random() * RANDOM_CODENAMES.length)];

    return {
        id: `agent-${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        codename: randomCodename,
        department: randomDept,
        team: `${randomTeamNum}팀`,
        rank: fixedRank,
        grade: fixedGrade,
        extension: `${Math.floor(Math.random() * 8999) + 1000}`,
        status: '정상',
        contamination: Math.floor(Math.random() * 40),
        rentals: [],
    };
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            agent: null,
            isAuthenticated: false,

            login: (personaKeyInput: string) => {
                const key = personaKeyInput.trim();

                // 1. 네임드 요원 확인 (키로 검색)
                let foundAgent = AGENT_PROFILES[key];

                // 2. 이름으로도 검색 지원
                if (!foundAgent) {
                    foundAgent = AGENT_NAME_MAP[key];
                }

                if (foundAgent) {
                    set({ agent: foundAgent, isAuthenticated: true });
                    return true;
                }

                // 3. 평범한 요원 (동적 생성)
                if (key.length > 0) {
                    const newAgent = createRandomAgent(key);
                    set({ agent: newAgent, isAuthenticated: true });
                    return true;
                }

                return false;
            },

            logout: () => {
                set({ agent: null, isAuthenticated: false });

                // Reset game store to clear contamination and game over state
                useGameStore.getState().reset();

                // Reset interaction store to clear triggered events and session data
                useInteractionStore.getState().resetInteractions();

                // Reset work store to clear session schedules, approvals, and accepted incidents
                useWorkStore.getState().resetSession();
            },
        }),
        {
            name: 'haetae_agent_session',
            storage: createJSONStorage(() => sessionStorage),
            // Custom deserializer to handle Dates if needed across reload
            // Zustand persist handles simple JSON. For Dates, we might need onRehydrateStorage
            // OR just store dates as strings and convert on use. 
            // The original Context did a manual parse. 
            // Let's stick to strings in storage and Objects in memory if possible, 
            // but for simplicity here we assume standard JSON behavior. 
            // If strict Date objects are needed, we might need a transformer.
            onRehydrateStorage: () => (state) => {
                if (state && state.agent) {
                    // Sync with latest AGENT_PROFILES to reflect code changes
                    if (state.agent.personaKey && AGENT_PROFILES[state.agent.personaKey]) {
                        const freshProfile = AGENT_PROFILES[state.agent.personaKey];
                        // Preserve user state (contamination, rentals) but update all static fields
                        const userContamination = state.agent.contamination;
                        const userRentals = state.agent.rentals;

                        state.agent = {
                            ...freshProfile, // Use fresh profile as base
                            contamination: userContamination, // Preserve user's contamination
                            rentals: userRentals, // Preserve user's rentals
                        };
                    }

                    // Revive Dates if necessary
                    if (state.agent.rentals) {
                        state.agent.rentals = state.agent.rentals.map((r: any) => ({
                            ...r,
                            rentalDate: r.rentalDate ? new Date(r.rentalDate) : undefined,
                            dueDate: r.dueDate ? new Date(r.dueDate) : undefined
                        }));
                    }
                }
            }
        }
    )
);
