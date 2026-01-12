import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

// 8.5 보안 처형 게임오버 설정
const FORBIDDEN_CONFIG = {
    TEXT: {
        MAIN_CHAR: '狱',
        SENTENCE: " 죄인은 오랏줄을 받으라\n"
    },
    DURATION: {
        FREEZE: 3000,
        FLASH: 2000,
        INITIAL_TYPING: 2000,
        HOLD: 3000,
        FILL_TYPING: 10000,
    },
    SPEED: {
        INITIAL_DELAY: 200,
        MIN_DELAY: 5,
        ACCELERATION_FACTOR: 0.95
    }
} as const;

export function ForbiddenExecutionSequence() {
    const { logout } = useAuthStore();
    const { isGameOver, gameOverType } = useUser();

    // State
    const [stage, setStage] = useState<'idle' | 'freeze' | 'flash' | 'initial_typing' | 'hold' | 'fill_typing'>('idle');
    const [text, setText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const safeSetTimeout = (callback: () => void, ms: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(callback, ms);
    };

    // Sequence Logic
    useEffect(() => {
        if (!isGameOver || gameOverType !== 'forbidden_login') {
            setStage('idle');
            setText('');
            return;
        }

        if (stage === 'idle') setStage('freeze');

        switch (stage) {
            case 'freeze':
                safeSetTimeout(() => setStage('flash'), FORBIDDEN_CONFIG.DURATION.FREEZE);
                break;
            case 'flash':
                safeSetTimeout(() => setStage('initial_typing'), FORBIDDEN_CONFIG.DURATION.FLASH);
                break;
            case 'initial_typing':
                setText(FORBIDDEN_CONFIG.TEXT.MAIN_CHAR);
                safeSetTimeout(() => setStage('hold'), FORBIDDEN_CONFIG.DURATION.INITIAL_TYPING);
                break;
            case 'hold':
                safeSetTimeout(() => setStage('fill_typing'), FORBIDDEN_CONFIG.DURATION.HOLD);
                break;
            case 'fill_typing':
                const startTime = Date.now();
                const sentence = FORBIDDEN_CONFIG.TEXT.SENTENCE;
                let fillCharIndex = 0;
                let currentDelay: number = FORBIDDEN_CONFIG.SPEED.INITIAL_DELAY;

                const typeRecursive = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= FORBIDDEN_CONFIG.DURATION.FILL_TYPING) {
                        logout();
                        window.location.reload();
                        return;
                    }
                    setText(prev => prev + sentence[fillCharIndex % sentence.length]);
                    fillCharIndex++;
                    if (containerRef.current) {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }
                    currentDelay = Math.max(FORBIDDEN_CONFIG.SPEED.MIN_DELAY, currentDelay * FORBIDDEN_CONFIG.SPEED.ACCELERATION_FACTOR);
                    safeSetTimeout(typeRecursive, currentDelay);
                };
                typeRecursive();
                break;
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isGameOver, gameOverType, stage, logout]);

    const isFreeze = stage === 'freeze';

    return (
        <div className={cn(
            "fixed inset-0 z-[9999] font-gungsu overflow-hidden",
            // Freeze stage: Grayout, block interaction via pointer-events-auto (overlay catches clicks)
            // Other stages: Black background, pass through pointer events (except text selection - wait, original had pointer-events-none?
            // Original: "bg-black text-white pointer-events-none" for non-freeze.
            isFreeze
                ? "bg-transparent backdrop-grayscale pointer-events-auto cursor-not-allowed"
                : "bg-black text-white pointer-events-none"
        )}>
            <style>{`
                .font-gungsu { font-family: "Gungsuh", "Batang", "Gungsu", serif; }
                @keyframes redFlash { 0%, 100% { background-color: black; } 50% { background-color: #500; } }
                .animate-red-flash { animation: redFlash 0.5s linear infinite; }
                .backdrop-grayscale { backdrop-filter: grayscale(100%); }
            `}</style>

            {stage === 'flash' && <div className="absolute inset-0 animate-red-flash z-10" />}

            {!isFreeze && (
                <div ref={containerRef} className="w-full h-full overflow-y-auto scrollbar-hide flex">
                    <div className="m-auto w-full flex flex-col items-center text-center p-8 md:p-12">
                        <div className="whitespace-pre-wrap leading-loose break-all">
                            {text.split('').map((char, index) => (
                                char === FORBIDDEN_CONFIG.TEXT.MAIN_CHAR ?
                                    <span key={index} className="block text-9xl md:text-[12rem] mb-8 font-bold text-white">{char}</span> :
                                    <span key={index} className="text-3xl md:text-5xl font-bold">{char}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isFreeze && (
                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 mix-blend-overlay" />
            )}
        </div>
    );
}
