import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';
import { useGameStore } from '@/store/gameStore';

export type GameOverType = 'none' | 'contamination' | 'forbidden_login';

interface UserContextType {
    contamination: number;
    updateContamination: (val: number) => void;
    decreaseContamination: (amount: number) => void;
    isGameOver: boolean;
    gameOverType: GameOverType;
    triggerGameOver: (type: GameOverType) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuthStore();
    const { mode } = useBureauStore();
    const SESSION_CONTAMINATION_KEY = 'haetae_agent_session'; // Not used directly, managed by stores

    // Use GameStore for single source of truth
    const {
        contamination,
        gameOverType,
        currentAgentId,
        updateContamination: storeUpdateContamination,
        decreaseContamination,
        triggerGameOver,
        startGameLoop,
        stopGameLoop,
        restoreFromSession,
        initializeForAgent
    } = useGameStore();

    const isGameOver = gameOverType !== 'none';

    // Sync UserContext lifecycle with GameStore
    useEffect(() => {
        if (agent) {
            // Check if this is a different agent (new login or agent switch)
            if (currentAgentId !== agent.id) {
                // Different agent - initialize with their default contamination
                initializeForAgent(agent);
            } else {
                // Same agent (e.g., page refresh) - restore and validate
                restoreFromSession(agent);
            }

            startGameLoop(agent);
        } else {
            stopGameLoop();
        }
    }, [agent?.id]); // Only re-run if agent changes

    // Wrapper to include agent in update
    const updateContamination = (val: number) => {
        if (agent) {
            storeUpdateContamination(val, agent);
        }
    };

    return (
        <UserContext.Provider value={{
            contamination,
            updateContamination,
            decreaseContamination,
            isGameOver,
            gameOverType,
            triggerGameOver
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
