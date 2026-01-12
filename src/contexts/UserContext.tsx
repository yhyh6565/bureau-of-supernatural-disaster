import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';

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
    const SESSION_CONTAMINATION_KEY = 'haetae_contamination';

    // Initialize from storage or agent default
    const [contamination, setContamination] = useState(() => {
        if (!agent) return 0;
        const stored = sessionStorage.getItem(SESSION_CONTAMINATION_KEY);
        return stored ? parseInt(stored, 10) : agent.contamination;
    });
    const [gameOverType, setGameOverType] = useState<GameOverType>('none');

    // Derived state for backward compatibility and general checks
    const isGameOver = gameOverType !== 'none';

    useEffect(() => {
        if (agent) {
            const stored = sessionStorage.getItem(SESSION_CONTAMINATION_KEY);
            if (stored) {
                const storedVal = parseInt(stored, 10);
                setContamination(storedVal);
                // Restore game over state if needed? For now, we only restore contamination.
                // Park Honglim exeption: Never trigger contamination game over
                if (storedVal >= 100 && agent.personaKey !== 'parkhonglim') setGameOverType('contamination');
                else setGameOverType('none');
            } else {
                setContamination(agent.contamination);
                setGameOverType('none'); // Reset on new login
            }
        } else {
            setContamination(0);
            setGameOverType('none');
            sessionStorage.removeItem(SESSION_CONTAMINATION_KEY);
        }
    }, [agent?.id]);

    // Sync to Storage
    useEffect(() => {
        if (agent) {
            sessionStorage.setItem(SESSION_CONTAMINATION_KEY, contamination.toString());
        }
    }, [contamination, agent]);

    // Auto-increase contamination
    useEffect(() => {
        if (!agent || isGameOver) return;
        // Exceptions: Fixed contamination for Park Honglim and Jang Hyeowoon
        if (['parkhonglim', 'janghyeowoon'].includes(agent.personaKey)) return;

        const interval = setInterval(() => {
            setContamination(prev => {
                const next = prev + 1;
                // Storage sync is handled by the effect above
                if (next >= 100) {
                    // Exceptions check
                    if (!['parkhonglim', 'janghyeowoon'].includes(agent.personaKey)) {
                        // Prevent Game Over if in Segwang mode
                        if (mode !== 'segwang') {
                            setGameOverType('contamination');
                        }
                    }
                    return 100;
                }
                return next;
            });
        }, 10000); // Increase by 1 every 10 seconds

        return () => clearInterval(interval);
    }, [agent, isGameOver, mode]);

    const updateContamination = (val: number) => {
        const clamped = Math.max(0, Math.min(100, val));
        setContamination(clamped);
        if (clamped >= 100 && agent?.personaKey !== 'parkhonglim' && mode !== 'segwang') {
            setGameOverType('contamination');
        }
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
