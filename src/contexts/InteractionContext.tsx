import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DataManager } from '@/data/dataManager';
import { Incident, Notification, TriggerType, Message } from '@/types/haetae';
import { useToast } from '@/hooks/use-toast';
import { EASTER_EGGS } from '@/constants/easterEggs';

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

export function InteractionProvider({ children }: { children: React.ReactNode }) {
    const { agent, isAuthenticated } = useAuthStore();
    const { toast } = useToast();

    const TRIGGERED_IDS_KEY = 'haetae_triggered_ids';
    const READ_IDS_KEY = 'haetae_read_ids';
    const SESSION_MESSAGES_KEY = 'haetae_session_messages';

    // Triggered Events (Incidents, Notifications) - Load from sessionStorage
    const [triggeredIds, setTriggeredIds] = useState<string[]>(() => {
        try {
            const saved = sessionStorage.getItem(TRIGGERED_IDS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Read Status (Notifications, Messages) - Load from sessionStorage
    const [readIds, setReadIds] = useState<string[]>(() => {
        try {
            const saved = sessionStorage.getItem(READ_IDS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // New Trigger Alert
    const [newlyTriggeredId, setNewlyTriggeredId] = useState<string | null>(null);

    // Session-based Messages (User sent or System triggered)
    const [sessionMessages, setSessionMessages] = useState<Message[]>(() => {
        try {
            const saved = sessionStorage.getItem(SESSION_MESSAGES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist triggeredIds to sessionStorage
    useEffect(() => {
        sessionStorage.setItem(TRIGGERED_IDS_KEY, JSON.stringify(triggeredIds));
    }, [triggeredIds]);

    // Persist readIds to sessionStorage
    useEffect(() => {
        sessionStorage.setItem(READ_IDS_KEY, JSON.stringify(readIds));
    }, [readIds]);

    // Persist sessionMessages to sessionStorage
    useEffect(() => {
        sessionStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(sessionMessages));
    }, [sessionMessages]);

    // Load initial triggers on login
    useEffect(() => {
        if (isAuthenticated && agent) {
            // On Login, check Time-based triggers
            checkTriggers('login');

            // Start timer for time-elapsed triggers
            const timer = setInterval(() => {
                checkTriggers('time-elapsed');
            }, 5000); // Check every 5 sec

            return () => clearInterval(timer);
        } else {
            // On logout, clear sessionStorage
            sessionStorage.removeItem(TRIGGERED_IDS_KEY);
            sessionStorage.removeItem(READ_IDS_KEY);
            setTriggeredIds([]);
            setReadIds([]);
            setSessionMessages([]);
            sessionStorage.removeItem(SESSION_MESSAGES_KEY);
        }
    }, [isAuthenticated, agent]);

    const checkTriggers = (type: TriggerType) => {
        // This is a simplified Mock trigger logic. 
        // In real app, we iterate over all data definitions to check 'trigger' field.
        // For now, hardcode some example logic or load from DataManager if extended.

        const allIncidents = DataManager.getIncidents(agent);
        const allNotices = DataManager.getNotifications(agent);

        // 1. Check Incidents
        allIncidents.forEach(incident => {
            // Logic for Sinkhole (30s delay)
            if (incident.id === 'inc-sinkhole-001') {
                // Check if already triggered
                if (triggeredIds.includes(incident.id)) return;

                // Check condition (30s elapsed)
                // Mock: We use a session start timestamp? 
                // For now, let's just say it triggers after a timeout in useEffect below.
            }
        });
    };

    // Specific logic for Sinkhole (Hardcoded for demo effect as requested in 4.1)
    useEffect(() => {
        if (!isAuthenticated) return;

        const sinkholeId = 'inc-sinkhole-001';
        const sinkholeNotiId = 'noti-sinkhole-alert';
        if (triggeredIds.includes(sinkholeId)) return;

        const timer = setTimeout(() => {
            // Update the notification's createdAt to NOW before triggering
            const allNotices = DataManager.getNotifications(agent);
            const sinkholeNotice = allNotices.find(n => n.id === sinkholeNotiId);
            if (sinkholeNotice) {
                sinkholeNotice.createdAt = new Date();
            }

            triggerEvent(sinkholeId, null); // Trigger the incident
            triggerEvent(sinkholeNotiId, sinkholeNotice); // Trigger the related notification with updated data
        }, 30000); // 30 sec

        return () => clearTimeout(timer);
    }, [isAuthenticated, triggeredIds, agent]);


    const sendMessage = (recipient: string, title: string, content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: agent?.id || 'unknown',
            senderName: agent?.name || 'Unknown',
            senderDepartment: agent?.department || 'baekho',
            receiverId: recipient,
            title: title,
            content: content,
            createdAt: new Date(),
            isRead: true, // Sender reads their own
        };

        setSessionMessages(prev => [...prev, newMessage]);

        // Mock Reply Logic (Optional)
    };

    const clearNewTrigger = () => {
        setNewlyTriggeredId(null);
    };

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
            if (item && 'createdAt' in item) {
                item.createdAt = new Date(); // Update to NOW
                if ('updatedAt' in item) item.updatedAt = new Date();
            }

            setNewlyTriggeredId(id);
            return [...prev, id];
        });
    };

    // Haunted Easter Egg Logic
    useEffect(() => {
        if (!isAuthenticated || !agent) return;

        // List of named agents to exclude
        const NAMED_AGENTS = ['박홍림', '최요원', '류재관', '김솔음', '해금', '고영은', '장허운'];

        // Loop through configured Easter Eggs
        EASTER_EGGS.forEach(egg => {
            if (egg.triggerType === 'time-elapsed' && egg.targetCondition === 'ordinary') {
                if (!NAMED_AGENTS.includes(agent.name)) {
                    const timer = setTimeout(() => {
                        const messageToAdd = {
                            ...(egg.message || {}),
                            receiverId: agent.id,
                            createdAt: egg.message?.createdAt ? new Date(egg.message.createdAt) : new Date(),
                            isRead: false
                        } as Message;

                        // Add to session messages
                        setSessionMessages(prev => {
                            if (prev.some(m => m.id === messageToAdd.id)) return prev;
                            return [...prev, messageToAdd];
                        });

                        // Trigger Toast
                        if (egg.toast) {
                            toast({
                                description: egg.toast.description,
                                duration: 5000,
                                className: egg.toast.className
                            });
                        }

                    }, egg.delaySeconds ? egg.delaySeconds * 1000 : 60000);

                    return () => clearTimeout(timer);
                }
            }
        });
    }, [isAuthenticated, agent]);

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

    return (
        <InteractionContext.Provider value={{
            triggeredIds,
            readIds,
            markAsRead,
            isRead,
            isTriggered,
            newlyTriggeredId,
            clearNewTrigger,
            sessionMessages,
            sendMessage
        }}>
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
