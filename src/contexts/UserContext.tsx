import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
    const { agent } = useAuth();
    const [contamination, setContamination] = useState(0);
    const [gameOverType, setGameOverType] = useState<GameOverType>('none');

    // Derived state for backward compatibility and general checks
    const isGameOver = gameOverType !== 'none';

    useEffect(() => {
        if (agent) {
            setContamination(agent.contamination);
            setGameOverType('none'); // Reset on login
        } else {
            setContamination(0);
            setGameOverType('none');
        }
    }, [agent?.id]);

    // Auto-increase contamination
    useEffect(() => {
        if (!agent || isGameOver) return;

        const interval = setInterval(() => {
            setContamination(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    setGameOverType('contamination');
                    return 100;
                }
                return next;
            });
        }, 7000); // Increase by 1 every 7 seconds

        return () => clearInterval(interval);
    }, [agent, isGameOver]);

    const updateContamination = (val: number) => {
        const clamped = Math.max(0, Math.min(100, val));
        setContamination(clamped);
        if (clamped >= 100) setGameOverType('contamination');
    };

    const decreaseContamination = (amount: number) => {
        setContamination(prev => Math.max(0, prev - amount));
    };

    const triggerGameOver = (type: GameOverType) => {
        setGameOverType(type);
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
