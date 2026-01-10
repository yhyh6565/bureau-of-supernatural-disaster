import { AlertTriangle, Radio } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useInteractionStore } from '@/store/interactionStore';
import { useWorkData } from '@/hooks/useWorkData';

const SINKHOLE_ID = 'inc-sinkhole-001';

export function DisasterTicker() {
    const { agent } = useAuthStore();
    const { triggeredIds, newlyTriggeredId } = useInteractionStore();
    const { processedIncidents } = useWorkData();

    // Helper to replicate context behavior
    const isTriggered = (id: string) => triggeredIds.includes(id);

    // Only show if the Sinkhole event is triggered
    const showTicker = isTriggered(SINKHOLE_ID);

    // Blink Effect State
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        if (newlyTriggeredId === SINKHOLE_ID) {
            setIsBlinking(true);
            const timer = setTimeout(() => setIsBlinking(false), 5000); // 5s blink
            return () => clearTimeout(timer);
        }
    }, [newlyTriggeredId]);

    // Use processedIncidents from WorkContext (Single Source of Truth)
    const incidents = processedIncidents;

    // Filter to show ONLY the Sinkhole incident in this special mode
    const targetIncident = incidents.find(i => i.id === SINKHOLE_ID);

    if (!showTicker || !targetIncident) return null;

    return (
        <div className={`
            h-9 md:h-12 flex items-center px-4 overflow-hidden relative transition-colors duration-500
            ${isBlinking ? 'animate-pulse bg-destructive text-destructive-foreground' : 'bg-destructive/10 border-b border-destructive/20'}
        `}>
            <div className={`flex items-center gap-2 font-bold text-sm whitespace-nowrap z-10 pr-4 
                ${isBlinking ? 'text-destructive-foreground' : 'text-destructive'}`}>
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="hidden sm:inline">재난 경보 발령:</span>
            </div>

            <div className="flex-1 flex items-center min-w-0">
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-sm font-medium truncate">
                    <span className={`mr-2 font-bold ${isBlinking ? 'text-white' : 'text-destructive'}`}>
                        [{targetIncident.dangerLevel}]
                    </span>
                    <span className={isBlinking ? 'text-white' : ''}>
                        {targetIncident.title} - {targetIncident.reportContent}
                    </span>
                    <span className={`ml-4 text-xs ${isBlinking ? 'text-white/80' : 'text-muted-foreground'}`}>
                        (현재 상태: {targetIncident.status})
                    </span>
                </div>
            </div>

            <div className={`text-xs font-mono whitespace-nowrap z-10 pl-4 border-l h-full flex items-center
                ${isBlinking ? 'border-white/30 text-white/80' : 'border-destructive/20 text-destructive/70'}`}>
                LIVE FEED
            </div>
        </div>
    );
}
