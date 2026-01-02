import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserContextType {
    contamination: number;
    updateContamination: (val: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuth();
    const [contamination, setContamination] = useState(0);

    useEffect(() => {
        if (agent) {
            setContamination(agent.contamination);
        } else {
            setContamination(0);
        }
    }, [agent?.id]);

    const updateContamination = (val: number) => {
        setContamination(val);
        // 필요 시 agent 객체 업데이트 로직 추가
    };

    return (
        <UserContext.Provider value={{ contamination, updateContamination }}>
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
