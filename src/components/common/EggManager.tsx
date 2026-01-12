import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useToast } from '@/hooks/use-toast';
import { DataManager } from '@/data/dataManager';
import { EASTER_EGGS } from '@/constants/easterEggs';
import { Message } from '@/types/haetae';

export function EggManager() {
    const { agent, isAuthenticated } = useAuthStore();
    const { triggeredIds, triggerEvent, addSessionMessage } = useInteractionStore();
    const { toast } = useToast();

    // Sinkhole Event Logic
    useEffect(() => {
        if (!isAuthenticated || !agent) return;

        const sinkholeId = 'inc-sinkhole-001';
        // If already triggered, do nothing
        if (triggeredIds.includes(sinkholeId)) return;

        const timer = setTimeout(() => {
            // 1. Trigger BOTH incident and notification IDs
            triggerEvent(sinkholeId); // Triggers 'inc-sinkhole-001' for incident list
            triggerEvent('noti-sinkhole-alert'); // Triggers notification for badge

            // 2. Show Toast
            toast({
                variant: "destructive",
                title: "긴급 공지 발생",
                description: "서울시 강남구 역삼동 강남역 사거리 대규모 싱크홀 발생",
                duration: 5000,
            });

            // 3. Update the DataManager resource to appear 'fresh'
            const allNotices = DataManager.getNotifications(agent);
            const sinkholeNotice = allNotices.find(n => n.id === 'noti-sinkhole-alert');
            if (sinkholeNotice) {
                sinkholeNotice.createdAt = new Date();
                sinkholeNotice.isRead = false;
            }

        }, 30000); // 30 seconds delay

        return () => clearTimeout(timer);
    }, [isAuthenticated, agent?.id, triggeredIds]);

    // Haunted Message Logic
    useEffect(() => {
        if (!isAuthenticated || !agent) return;

        // List of named agents to exclude (Agents who shouldn't get the haunted message)
        const NAMED_AGENTS = ['박홍림', '최요원', '류재관', '김솔음', '해금', '고영은', '장허운', '강준호'];

        EASTER_EGGS.forEach(egg => {
            if (egg.triggerType === 'time-elapsed' && egg.targetCondition === 'ordinary') {
                // Skip if agent is one of the Named Agents
                if (NAMED_AGENTS.includes(agent.name)) return;

                // Skip if already received (check locally or in store? Store doesn't persist session messages by ID easily if dynamic)
                // For simplicity, we just run the timer once per mounting/login session.

                const timer = setTimeout(() => {
                    const messageToAdd: Message = {
                        id: egg.message?.id || `msg-haunted-${Date.now()}`,
                        senderId: egg.message?.senderId || 'unknown',
                        senderName: egg.message?.senderName || 'Unknown',
                        senderDepartment: (egg.message?.senderDepartment || 'Unknown') as any,
                        receiverId: agent.id,
                        title: egg.message?.title || '',
                        content: egg.message?.content || '',
                        createdAt: egg.message?.createdAt ? new Date(egg.message.createdAt) : new Date(),
                        isRead: false,
                    };

                    addSessionMessage(messageToAdd);

                    if (egg.toast) {
                        toast({
                            description: egg.toast.description,
                            variant: egg.toast.variant,
                            className: egg.toast.className,
                            duration: 5000,
                        });
                    }

                }, egg.delaySeconds ? egg.delaySeconds * 1000 : 60000); // Default 60s

                return () => clearTimeout(timer);
            }
        });
    }, [isAuthenticated, agent?.id, agent?.name]);

    return null;
}
