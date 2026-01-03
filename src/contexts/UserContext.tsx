import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
    contamination: number;
    updateContamination: (val: number) => void;
    decreaseContamination: (amount: number) => void;
    isGameOver: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuth();
    const [contamination, setContamination] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        if (agent) {
            setContamination(agent.contamination);
            setIsGameOver(false); // Reset on login
        } else {
            setContamination(0);
            setIsGameOver(false);
        }
    }, [agent?.id]);

    // Auto-increase contamination
    useEffect(() => {
        if (!agent || isGameOver) return;

        const interval = setInterval(() => {
            setContamination(prev => {
                const next = prev + 1;
                if (next >= 100) {
                    setIsGameOver(true);
                    return 100;
                }
                return next;
            });
        }, 10000); // Increase by 1 every 10 seconds

        return () => clearInterval(interval);
    }, [agent, isGameOver]);

    const updateContamination = (val: number) => {
        const clamped = Math.max(0, Math.min(100, val));
        setContamination(clamped);
        if (clamped >= 100) setIsGameOver(true);
    };

    const decreaseContamination = (amount: number) => {
        setContamination(prev => Math.max(0, prev - amount));
    };

    return (
        <UserContext.Provider value={{ contamination, updateContamination, decreaseContamination, isGameOver }}>
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
