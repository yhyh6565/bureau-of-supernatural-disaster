import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { DataManager } from '@/data/dataManager';
import { Incident, Notification, TriggerType, Message } from '@/types/haetae';
import { useToast } from '@/hooks/use-toast';

interface InteractionContextType {
    triggeredIds: string[];
    readIds: string[];
    markAsRead: (id: string) => void;
    isRead: (id: string) => boolean;
    isTriggered: (id: string) => boolean;
    newlyTriggeredId: string | null;
    clearNewTrigger: () => void;
    sessionMessages: Message[];
    sendMessage: (recipient: string, title: string, content: string) => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

const SESSION_MESSAGES_KEY = 'haetae_session_messages';
const SESSION_TRIGGERED_KEY = 'haetae_triggered_ids';

export function InteractionProvider({ children }: { children: React.ReactNode }) {
    const { agent, isAuthenticated } = useAuth();

    // Initialize triggeredIds from session storage
    const [triggeredIds, setTriggeredIds] = useState<string[]>(() => {
        const stored = sessionStorage.getItem(SESSION_TRIGGERED_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const [readIds, setReadIds] = useState<string[]>([]);
    const [newlyTriggeredId, setNewlyTriggeredId] = useState<string | null>(null);
    const { toast } = useToast();

    // Session Messages State
    const [sessionMessages, setSessionMessages] = useState<Message[]>(() => {
        const stored = sessionStorage.getItem(SESSION_MESSAGES_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert Date strings back to Date objects
                return parsed.map((msg: any) => ({
                    ...msg,
                    createdAt: new Date(msg.createdAt)
                }));
            } catch (e) {
                console.error("Failed to parse session messages", e);
                return [];
            }
        }
        return [];
    });

    // Reset on logout
    useEffect(() => {
        if (!isAuthenticated) {
            setTriggeredIds([]);
            setReadIds([]);
            setNewlyTriggeredId(null);
            // Clear session messages on logout
            setSessionMessages([]);
            sessionStorage.removeItem(SESSION_MESSAGES_KEY);
            sessionStorage.removeItem(SESSION_TRIGGERED_KEY);
        }
    }, [isAuthenticated]);

    // Sync triggeredIds to sessionStorage
    useEffect(() => {
        sessionStorage.setItem(SESSION_TRIGGERED_KEY, JSON.stringify(triggeredIds));
    }, [triggeredIds]);

    // Sync sessionMessages to sessionStorage
    useEffect(() => {
        if (sessionMessages.length > 0) {
            sessionStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(sessionMessages));
        }
    }, [sessionMessages]);

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

    const sendMessage = (recipient: string, title: string, content: string) => {
        if (!agent) return;

        const newMessage: Message = {
            id: `msg-session-${Date.now()}`,
            senderId: agent.id,
            senderName: agent.name,
            senderDepartment: agent.department === 'baekho' ? '신규조사반' : agent.department === 'hyunmu' ? '출동구조반' : '현장정리반', // Simple mapping
            receiverId: recipient, // Use input recipient name as ID/Name for display
            title: title,
            content: content,
            createdAt: new Date(),
            isRead: false,
            // Trigger not needed for user sent messages usually
        };

        setSessionMessages(prev => [newMessage, ...prev]);

        toast({
            title: '쪽지 발송 완료',
            description: `${recipient}님에게 쪽지를 발송했습니다.`,
        });
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
                sessionMessages,
                sendMessage,
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
