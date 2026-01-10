import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, TriggerType, Agent } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';

interface InteractionState {
    triggeredIds: string[];
    readIds: string[];
    newlyTriggeredId: string | null;
    sessionMessages: Message[];

    // Actions
    triggerEvent: (id: string, item?: any) => void;
    markAsRead: (id: string) => void;
    clearNewTrigger: () => void;
    addSessionMessage: (message: Message) => void;
    sendMessage: (agent: Agent, recipientId: string, title: string, content: string) => Promise<boolean>;
    resetInteractions: () => void;
}

export const useInteractionStore = create<InteractionState>()(
    persist(
        (set, get) => ({
            triggeredIds: [],
            readIds: [],
            newlyTriggeredId: null,
            sessionMessages: [],

            triggerEvent: (id, item) => {
                set(state => {
                    if (state.triggeredIds.includes(id)) return state;

                    // Update item timestamp if provided (mutable reference pattern from DataManager)
                    if (item && typeof item === 'object' && 'createdAt' in item) {
                        item.createdAt = new Date();
                        if ('updatedAt' in item) item.updatedAt = new Date();
                    }

                    return {
                        triggeredIds: [...state.triggeredIds, id],
                        newlyTriggeredId: id
                    };
                });
            },

            markAsRead: (id) => {
                set(state => {
                    if (state.readIds.includes(id)) return state;
                    return { readIds: [...state.readIds, id] };
                });
            },

            clearNewTrigger: () => set({ newlyTriggeredId: null }),

            addSessionMessage: (message) => {
                set(state => ({ sessionMessages: [...state.sessionMessages, message] }));
            },

            sendMessage: async (agent, recipientId, title, content) => {
                const recipient = DataManager.getAgents().find(p => p.id === recipientId || p.personaKey === recipientId);

                // Allow sending even if recipient not found for now, or fail?
                // Context allowed it but just didn't do anything special.
                // Let's assume valid ID is required for a 'real' system, but here just fall through.

                const newMessage: Message = {
                    id: `msg-sent-${Date.now()}`,
                    senderId: agent.id,
                    senderName: agent.name,
                    senderDepartment: agent.department,
                    receiverId: recipientId, // Keep original ID if not found
                    title,
                    content,
                    createdAt: new Date(),
                    isRead: true
                };

                set(state => ({ sessionMessages: [...state.sessionMessages, newMessage] }));

                // Auto-reply logic
                if (recipient && recipient.personaKey === 'koyoungeun' && recipient.status === '퇴사') {
                    const reply: Message = {
                        id: `msg-reply-${Date.now()}`,
                        senderId: 'system',
                        senderName: '시스템',
                        senderDepartment: '전산팀',
                        receiverId: agent.id,
                        title: `[발신 실패] 수신자 불명`,
                        content: `수신자(${recipient.name})는 현재 재직 중이 아닙니다. 메시지를 전송할 수 없습니다.`,
                        createdAt: new Date(),
                        isRead: false
                    };
                    setTimeout(() => {
                        set(state => ({ sessionMessages: [...state.sessionMessages, reply] }));
                    }, 1000);
                }

                return true;
            },

            resetInteractions: () => {
                set({
                    triggeredIds: [],
                    readIds: [],
                    newlyTriggeredId: null,
                    sessionMessages: []
                });
            }
        }),
        {
            name: 'haetae_interaction_session',
            storage: createJSONStorage(() => sessionStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    if (state.sessionMessages) {
                        state.sessionMessages = state.sessionMessages.map((m: any) => ({
                            ...m,
                            createdAt: new Date(m.createdAt)
                        }));
                    }
                }
            }
        }
    )
);
