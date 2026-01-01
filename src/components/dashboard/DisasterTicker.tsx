import { DataManager } from '@/data/dataManager';
import { AlertTriangle, Radio } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function DisasterTicker() {
    const { agent } = useAuth();
    const incidents = DataManager.getIncidents(agent);

    // High priority incidents (Brain/High types or specialized keywords)
    const activeHighPriority = incidents.filter(i =>
        (i.dangerLevel === '뇌형' || i.dangerLevel === '고형') &&
        i.status !== '종결'
    );

    const activeCount = incidents.filter(i => i.status !== '종결').length;

    // Rotation logic for multiple alerts
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (activeHighPriority.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % activeHighPriority.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [activeHighPriority.length]);

    return (
        <div className="bg-destructive/10 border-b border-destructive/20 h-10 flex items-center px-4 overflow-hidden relative">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm whitespace-nowrap z-10 bg-background/0 pr-4">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">재난 경보 발령:</span>
            </div>

            <div className="flex-1 flex items-center overflow-hidden">
                {activeHighPriority.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 whitespace-nowrap text-sm font-medium">
                        <span className="text-destructive mr-2">[{activeHighPriority[currentIndex].dangerLevel}]</span>
                        {activeHighPriority[currentIndex].location} - {activeHighPriority[currentIndex].reportContent.slice(0, 40)}...
                        <span className="ml-4 text-xs text-muted-foreground">
                            (대응 중: {activeHighPriority[currentIndex].status})
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>현재 특이 단계의 재난 징후가 없습니다. 관할 지역 {activeCount}건 통상 관리 중.</span>
                    </div>
                )}
            </div>

            <div className="text-xs font-mono text-destructive/70 whitespace-nowrap z-10 pl-4 border-l border-destructive/20 h-full flex items-center">
                LIVE FEED
            </div>
        </div>
    );
}
