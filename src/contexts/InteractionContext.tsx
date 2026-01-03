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

    // Track scheduled triggers to avoid duplicate timeouts
    const scheduledTriggers = React.useRef<Set<string>>(new Set());

    // Check triggers
    useEffect(() => {
        if (!isAuthenticated || !agent) return;

        const checkTriggers = () => {
            const incidents = DataManager.getIncidents(agent);
            const notifications = DataManager.getNotifications(agent);

            const allItems = [...incidents, ...notifications];

            allItems.forEach((item) => {
                // Skip if already triggered OR already scheduled
                if (!item.trigger || triggeredIds.includes(item.id) || scheduledTriggers.current.has(item.id)) return;

                // Skip if NOT time-elapsed
                if (item.trigger.type !== 'time-elapsed') return;

                // Support both 'delay' field and 'value' (if number) for time
                const delay = item.trigger.delay ?? (typeof item.trigger.value === 'number' ? item.trigger.value : 0);

                // Mark as scheduled
                scheduledTriggers.current.add(item.id);

                // Set timeout
                setTimeout(() => {
                    triggerEvent(item.id, item);
                    // Optional: remove from scheduledTriggers if we want to allow re-trigger logic later? 
                    // But for "once per session", we keep it or rely on triggeredIds check next time.
                    // Ideally we should CLEANUP scheduledTriggers if component unmounts?
                    // But here triggeredIds will strictly prevent it.
                }, delay);
            });
        };

        checkTriggers();
    }, [isAuthenticated, agent, triggeredIds]); // Add triggeredIds to dependency to ensure checks use fresh state

    const triggerEvent = (id: string, item: any) => {
        setTriggeredIds((prev) => {
            if (prev.includes(id)) return prev;

            // Trigger Toast for Sinkhole Event
            if (id === 'inc-sinkhole-001') {
                toast({
                    variant: "destructive",
                    title: "긴급 공지 발생",
                    description: "서울시 강남구 역삼동 강남역 사거리 대규모 싱크홀 발생",
                    duration: 5000,
                });
            }

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
