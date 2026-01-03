import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { DataManager } from '@/data/dataManager';
import { Incident, Notification, TriggerType } from '@/types/haetae';
import { useToast } from '@/hooks/use-toast';

interface InteractionContextType {
    triggeredIds: string[];
    readIds: string[];
    markAsRead: (id: string) => void;
    isRead: (id: string) => boolean;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export function InteractionProvider({ children }: { children: React.ReactNode }) {
    const { agent, isAuthenticated } = useAuth();
    const [triggeredIds, setTriggeredIds] = useState<string[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [newlyTriggeredId, setNewlyTriggeredId] = useState<string | null>(null);
    const { toast } = useToast();

    // Reset on logout
    useEffect(() => {
        if (!isAuthenticated) {
            setTriggeredIds([]);
            setReadIds([]);
            setNewlyTriggeredId(null);
        }
    }, [isAuthenticated]);

    // Check triggers
    useEffect(() => {
        if (!isAuthenticated || !agent) return;

        const checkTriggers = () => {
            // 1. Get all potential items (Incidents, Notifications, Messages)
            // We check Global Incidents and Global Notifications for now as per requirement
            // Ideally DataManager should give access to ALL raw data, but here we can fetch lists
            const incidents = DataManager.getIncidents(agent);
            const notifications = DataManager.getNotifications(agent);

            const allItems = [...incidents, ...notifications];

            allItems.forEach((item) => {
                // Skip if already triggered or no trigger
                if (!item.trigger || triggeredIds.includes(item.id)) return;
                // Skip if NOT time-elapsed (for now handling only time-elapsed)
                if (item.trigger.type !== 'time-elapsed') return;

                const delay = item.trigger.delay || 0;

                // Set timeout
                setTimeout(() => {
                    triggerEvent(item.id, item);
                }, delay);
            });
        };

        checkTriggers();
    }, [isAuthenticated, agent]); // Run once on login

    const triggerEvent = (id: string, item: any) => {
        setTriggeredIds((prev) => {
            if (prev.includes(id)) return prev;

            // Update DataManager logic for 'Real-time' if needed?
            // Since DataManager objects are references, we can mutate them here for the session
            if ('createdAt' in item) {
                item.createdAt = new Date(); // Update to NOW
                if ('updatedAt' in item) item.updatedAt = new Date();
            }

            setNewlyTriggeredId(id);
            return [...prev, id];
        });
    };

    const markAsRead = (id: string) => {
        setReadIds(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const isTriggered = (id: string) => {
        return triggeredIds.includes(id);
    };

    const isRead = (id: string) => {
        return readIds.includes(id);
    };

    const clearNewTrigger = () => {
        setNewlyTriggeredId(null);
    };

    return (
        <InteractionContext.Provider
            value={{
                triggeredIds,
                readIds,
                isTriggered,
                isRead,
                markAsRead,
                newlyTriggeredId,
                clearNewTrigger,
            }}
        >
            {children}
        </InteractionContext.Provider>
    );
}

export function useInteraction() {
    const context = useContext(InteractionContext);
    if (context === undefined) {
        throw new Error('useInteraction must be used within an InteractionProvider');
    }
    return context;
}
