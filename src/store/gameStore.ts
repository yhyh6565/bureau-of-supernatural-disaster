import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Agent } from '@/types/haetae';
import { useBureauStore } from './bureauStore';

export type GameOverType = 'none' | 'contamination' | 'forbidden_login';

interface GameState {
    contamination: number;
    gameOverType: GameOverType;
    isGameLoopRunning: boolean;

    // Actions
    updateContamination: (val: number, agent: Agent) => void;
    decreaseContamination: (amount: number) => void;
    triggerGameOver: (type: GameOverType) => void;
    startGameLoop: (agent: Agent) => void;
    stopGameLoop: () => void;
    restoreFromSession: (agent: Agent) => void;
}

let gameInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            contamination: 0,
            gameOverType: 'none',
            isGameLoopRunning: false,

            restoreFromSession: (agent) => {
                set(state => {
                    // Check if agent logic needs to apply immediate exceptions
                    if (['parkhonglim', 'janghyeowoon'].includes(agent.personaKey)) {
                        // They might have fixed logic, but assume session value is correct for now
                    }

                    // Park Honglim exeption: Never trigger contamination game over even if 100
                    if (state.contamination >= 100 && agent.personaKey !== 'parkhonglim') {
                        return { gameOverType: 'contamination' };
                    }
                    if (state.gameOverType === 'contamination' && state.contamination < 100) {
                        return { gameOverType: 'none' };
                    }
                    return {};
                });
            },

            updateContamination: (val, agent) => {
                const clamped = Math.max(0, Math.min(100, val));
                const mode = useBureauStore.getState().mode;

                set(state => {
                    let newGameOverType = state.gameOverType;

                    if (clamped >= 100 && agent?.personaKey !== 'parkhonglim' && mode !== 'segwang') {
                        newGameOverType = 'contamination';
                    }

                    return { contamination: clamped, gameOverType: newGameOverType };
                });
            },

            decreaseContamination: (amount) => {
                set(state => ({ contamination: Math.max(0, state.contamination - amount) }));
            },

            triggerGameOver: (type) => set({ gameOverType: type }),

            startGameLoop: (agent) => {
                if (get().isGameLoopRunning) return;

                if (['parkhonglim', 'janghyeowoon'].includes(agent.personaKey)) return;

                set({ isGameLoopRunning: true });

                if (gameInterval) clearInterval(gameInterval);
                gameInterval = setInterval(() => {
                    const { contamination, gameOverType } = get();
                    const mode = useBureauStore.getState().mode;

                    if (gameOverType !== 'none') return;

                    const next = contamination + 1;

                    if (next >= 100) {
                        if (!['parkhonglim', 'janghyeowoon'].includes(agent.personaKey)) {
                            if (mode !== 'segwang') {
                                set({ contamination: 100, gameOverType: 'contamination' });
                            } else {
                                set({ contamination: 100 });
                            }
                        } else {
                            set({ contamination: 100 });
                        }
                    } else {
                        set({ contamination: next });
                    }

                }, 10000); // 10 seconds
            },

            stopGameLoop: () => {
                set({ isGameLoopRunning: false });
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = null;
                }
            }
        }),
        {
            name: 'haetae_game_session',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
