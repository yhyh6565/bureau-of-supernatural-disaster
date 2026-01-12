import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { useDomCensorship } from '@/hooks/useDomCensorship';

// 8.4 정신 오염 게임오버 설정
const CONTAMINATION_CONFIG = {
    TEXT: {
        EXPULSION_CHAR: '退', // 물러날 퇴
    },
    DURATION: {
        CENSORSHIP: 7000,
        EXPULSION: 3000,
    },
} as const;

export function MentalExpulsionSequence() {
    const { logout } = useAuthStore();
    const { isGameOver, gameOverType } = useUser();

    // State
    const [stage, setStage] = useState<'idle' | 'censorship' | 'expulsion'>('idle');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const safeSetTimeout = (callback: () => void, ms: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(callback, ms);
    };

    // Transition Logic
    useEffect(() => {
        if (!isGameOver || gameOverType !== 'contamination') {
            setStage('idle');
            return;
        }

        if (stage === 'idle') setStage('censorship');

        // Note: Censorship stage auto-transitions via hook callback

        if (stage === 'expulsion') {
            safeSetTimeout(() => {
                logout();
                window.location.reload();
            }, CONTAMINATION_CONFIG.DURATION.EXPULSION);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isGameOver, gameOverType, stage, logout]);

    // Use Custom Hook for Censorship
    useDomCensorship(
        stage === 'censorship',
        CONTAMINATION_CONFIG.DURATION.CENSORSHIP,
        () => setStage('expulsion')
    );

    // Render
    const isExpulsion = stage === 'expulsion';

    if (stage === 'censorship') {
        // Censorship overlay (invisible but blocking interaction)
        return <div className="fixed inset-0 z-[9999] bg-transparent cursor-none" onClick={(e) => e.stopPropagation()} />;
    }

    if (isExpulsion) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#FFC400] text-[#D80000] font-gungsu flex items-center justify-center overflow-hidden">
                <style>{`
                    .font-gungsu { font-family: "Gungsuh", "Batang", "Gungsu", serif; }
                `}</style>

                <div className="relative">
                    {/* '退' Character: Talisman Style */}
                    <span className="text-[20rem] md:text-[30rem] leading-none select-none">
                        {CONTAMINATION_CONFIG.TEXT.EXPULSION_CHAR}
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
