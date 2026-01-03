
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

const CONFIG = {
    TEXT: {
        MAIN_CHAR: '狱',
        SENTENCE: " 죄인은 오랏줄을 받으라\n"
    },
    DURATION: {
        FLASH: 2000,
        INITIAL_TYPING: 2000, // Wait time after showing '狱'
        HOLD: 3000,
        FILL_TYPING: 10000,
    },
    SPEED: {
        INITIAL_DELAY: 200,
        MIN_DELAY: 5,
        ACCELERATION_FACTOR: 0.95
    }
} as const;

export function ContaminationGameOver() {
    const { logout } = useAuth();
    const { isGameOver } = useUser();

    // Stages: 
    // 'idle': Initial state
    // 'flash': Red flashing
    // 'initial_typing': Type '狱' only
    // 'hold': Wait
    // 'fill_typing': Infinite typing
    const [stage, setStage] = useState<'idle' | 'flash' | 'initial_typing' | 'hold' | 'fill_typing'>('idle');

    // Content state
    const [textContent, setTextContent] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset loop ensuring cleanup
    const safeSetTimeout = (callback: () => void, ms: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(callback, ms);
    };

    useEffect(() => {
        if (isGameOver && stage === 'idle') {
            setStage('flash');
        }
    }, [isGameOver, stage]);

    useEffect(() => {
        if (!isGameOver) {
            setStage('idle');
            setTextContent('');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        switch (stage) {
            case 'flash':
                safeSetTimeout(() => {
                    setStage('initial_typing');
                }, CONFIG.DURATION.FLASH);
                break;

            case 'initial_typing':
                setTextContent(CONFIG.TEXT.MAIN_CHAR);
                safeSetTimeout(() => {
                    setStage('hold');
                }, CONFIG.DURATION.INITIAL_TYPING);
                break;

            case 'hold':
                safeSetTimeout(() => {
                    setStage('fill_typing');
                }, CONFIG.DURATION.HOLD);
                break;

            case 'fill_typing':
                const startTime = Date.now();
                const sentence = CONFIG.TEXT.SENTENCE;
                let fillCharIndex = 0;
                let currentDelay: number = CONFIG.SPEED.INITIAL_DELAY;

                const typeRecursive = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= CONFIG.DURATION.FILL_TYPING) {
                        logout();
                        window.location.reload();
                        return;
                    }

                    // Add one character
                    const charToAdd = sentence[fillCharIndex % sentence.length];
                    setTextContent(prev => prev + charToAdd);
                    fillCharIndex++;

                    // Auto-scroll
                    if (containerRef.current) {
                        // Using scrollHeight to keep following the bottom
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }

                    // Accelerate
                    currentDelay = Math.max(CONFIG.SPEED.MIN_DELAY, currentDelay * CONFIG.SPEED.ACCELERATION_FACTOR);

                    // Schedule next
                    safeSetTimeout(typeRecursive, currentDelay);
                };

                typeRecursive();
                break;
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [stage, isGameOver, logout]);

    if (!isGameOver) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black text-white font-gungsu overflow-hidden pointer-events-none">
            {/* Font Injection if not available in Tailwind */}
            <style>{`
                .font-gungsu {
                    font-family: "Gungsuh", "Batang", "Gungsu", serif;
                }
                @keyframes redFlash {
                    0%, 100% { background-color: black; }
                    50% { background-color: #500; }
                }
                .animate-red-flash {
                    animation: redFlash 0.5s linear infinite;
                }
            `}</style>

            {/* Stage 1: Red Flash Overlay */}
            {stage === 'flash' && (
                <div className="absolute inset-0 animate-red-flash z-10" />
            )}

            {/* Text Container */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-auto scrollbar-hide flex"
            >
                <div className="m-auto w-full flex flex-col items-center text-center p-8 md:p-12">
                    <div className="whitespace-pre-wrap leading-loose break-all">
                        {textContent.split('').map((char, index) => {
                            if (char === CONFIG.TEXT.MAIN_CHAR) {
                                return (
                                    <span key={index} className="block text-9xl md:text-[12rem] mb-8 font-bold text-white">
                                        {char}
                                    </span>
                                );
                            }
                            return (
                                <span key={index} className="text-3xl md:text-5xl font-bold">
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Noise Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 mix-blend-overlay" />
        </div>
    );
}
