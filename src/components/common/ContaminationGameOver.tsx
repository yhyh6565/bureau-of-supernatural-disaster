import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

// Configuration for "Forbidden Login" (Security Execution)
// 8.5 보안 처형 게임오버
const FORBIDDEN_CONFIG = {
    TEXT: {
        MAIN_CHAR: '狱',
        SENTENCE: " 죄인은 오랏줄을 받으라\n"
    },
    DURATION: {
        FREEZE: 3000,   // 추가된 동결 시간
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

// Configuration for "Mental Contamination"
// 8.4 정신 오염 게임오버
const CONTAMINATION_CONFIG = {
    TEXT: {
        EXPULSION_CHAR: '退', // 물러날 퇴
    },
    DURATION: {
        CENSORSHIP: 7000, // 7초간 텍스트 오염
        BLACKOUT: 100, // 즉시 암전 (0.1초)
        EXPULSION: 3000, // '退' 3초 유지
    },
} as const;

export function ContaminationGameOver() {
    const { logout } = useAuthStore();
    const { gameOverType } = useGameStore();
    const isGameOver = gameOverType !== 'none';

    // Common State
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const safeSetTimeout = (callback: () => void, ms: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(callback, ms);
    };

    // --------------------------------------------------------------------------------
    // Logic: Forbidden Login (Legacy Sequence)
    // --------------------------------------------------------------------------------
    const [forbiddenStage, setForbiddenStage] = useState<'idle' | 'freeze' | 'flash' | 'initial_typing' | 'hold' | 'fill_typing'>('idle');
    const [forbiddenText, setForbiddenText] = useState('');
    const forbiddenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isGameOver || gameOverType !== 'forbidden_login') {
            setForbiddenStage('idle');
            setForbiddenText('');
            return;
        }

        if (forbiddenStage === 'idle') setForbiddenStage('freeze');

        switch (forbiddenStage) {
            case 'freeze':
                safeSetTimeout(() => setForbiddenStage('flash'), FORBIDDEN_CONFIG.DURATION.FREEZE);
                break;
            case 'flash':
                safeSetTimeout(() => setForbiddenStage('initial_typing'), FORBIDDEN_CONFIG.DURATION.FLASH);
                break;
            case 'initial_typing':
                setForbiddenText(FORBIDDEN_CONFIG.TEXT.MAIN_CHAR);
                safeSetTimeout(() => setForbiddenStage('hold'), FORBIDDEN_CONFIG.DURATION.INITIAL_TYPING);
                break;
            case 'hold':
                safeSetTimeout(() => setForbiddenStage('fill_typing'), FORBIDDEN_CONFIG.DURATION.HOLD);
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
                    setForbiddenText(prev => prev + sentence[fillCharIndex % sentence.length]);
                    fillCharIndex++;
                    if (forbiddenContainerRef.current) {
                        forbiddenContainerRef.current.scrollTop = forbiddenContainerRef.current.scrollHeight;
                    }
                    currentDelay = Math.max(FORBIDDEN_CONFIG.SPEED.MIN_DELAY, currentDelay * FORBIDDEN_CONFIG.SPEED.ACCELERATION_FACTOR);
                    safeSetTimeout(typeRecursive, currentDelay);
                };
                typeRecursive();
                break;
        }
    }, [isGameOver, gameOverType, forbiddenStage]);


    // --------------------------------------------------------------------------------
    // Logic: Mental Contamination (New Sequence)
    // --------------------------------------------------------------------------------
    const [soilStage, setSoilStage] = useState<'idle' | 'censorship' | 'blackout' | 'expulsion'>('idle');
    const requestRef = useRef<number>();

    useEffect(() => {
        if (!isGameOver || gameOverType !== 'contamination') {
            setSoilStage('idle');
            // Cleanup logic if needed (e.g. restore DOM? No, we reload anyway)
            return;
        }

        if (soilStage === 'idle') setSoilStage('censorship');

        if (soilStage === 'censorship') {
            const startTime = Date.now();
            const duration = CONTAMINATION_CONFIG.DURATION.CENSORSHIP;

            // Collect all text nodes
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => {
                    // Skip script/style tags and empty nodes
                    if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                    if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });

            const textNodes: Text[] = [];
            while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

            const animateCensorship = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1); // 0 to 1

                // Determine how many characters to corrupt based on progress
                // We want to corrupt ALL characters by the end.
                // It's expensive to iterate all nodes every frame.
                // Instead, we can process a random subset or chunk every frame.

                // Heuristic: Exponential acceleration (Slow start, Fast end)
                // Use power of 5 for very slow start, accelerating sharply towards the end
                const corruptionProbability = Math.pow(progress, 5);

                textNodes.forEach(node => {
                    const original = node.nodeValue || '';
                    // Optimization: Skip if fully corrupted (checking if any non-square char exists)
                    if (!/[^ \n■]/.test(original)) return;

                    const chars = original.split('');
                    let modified = false;
                    for (let i = 0; i < chars.length; i++) {
                        if (chars[i] !== '■' && chars[i] !== ' ' && chars[i] !== '\n') {
                            // Conditional corruption based on exponential progress
                            if (Math.random() < corruptionProbability) {
                                chars[i] = '■';
                                modified = true;
                            }
                        }
                    }

                    if (modified) {
                        node.nodeValue = chars.join('');
                    }

                    // Force full corruption at the very end to ensure clean finish
                    if (progress > 0.98) {
                        node.nodeValue = node.nodeValue?.replace(/[^ \n■]/g, '■') || '';
                    }
                });

                if (elapsed < duration) {
                    requestRef.current = requestAnimationFrame(animateCensorship);
                } else {
                    setSoilStage('blackout');
                }
            };
            requestRef.current = requestAnimationFrame(animateCensorship);

        } else if (soilStage === 'blackout') {
            safeSetTimeout(() => {
                setSoilStage('expulsion');
            }, CONTAMINATION_CONFIG.DURATION.BLACKOUT);

        } else if (soilStage === 'expulsion') {
            safeSetTimeout(() => {
                logout();
                window.location.reload();
            }, CONTAMINATION_CONFIG.DURATION.EXPULSION);
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isGameOver, gameOverType, soilStage]);


    // --------------------------------------------------------------------------------
    // Render
    // --------------------------------------------------------------------------------
    if (!isGameOver) return null;

    // Render Forbidden Login Sequence
    if (gameOverType === 'forbidden_login') {
        const isFreeze = forbiddenStage === 'freeze';

        return (
            <div className={cn(
                "fixed inset-0 z-[9999] font-gungsu overflow-hidden",
                // Freeze stage: Grayout, allow pointer events to block interaction with underlying elements
                // Other stages: Black background, pass through pointer events (except text selection)
                isFreeze
                    ? "bg-transparent backdrop-grayscale pointer-events-auto cursor-not-allowed"
                    : "bg-black text-white pointer-events-none"
            )}>
                <style>{`
                    .font-gungsu { font-family: "Gungsuh", "Batang", "Gungsu", serif; }
                    @keyframes redFlash { 0%, 100% { background-color: black; } 50% { background-color: #500; } }
                    .animate-red-flash { animation: redFlash 0.5s linear infinite; }
                    /* Make everything grayscale */
                    .backdrop-grayscale { backdrop-filter: grayscale(100%); }
                `}</style>

                {forbiddenStage === 'flash' && <div className="absolute inset-0 animate-red-flash z-10" />}

                {!isFreeze && (
                    <div ref={forbiddenContainerRef} className="w-full h-full overflow-y-auto scrollbar-hide flex">
                        <div className="m-auto w-full flex flex-col items-center text-center p-8 md:p-12">
                            <div className="whitespace-pre-wrap leading-loose break-all">
                                {forbiddenText.split('').map((char, index) => (
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

    // Render Mental Contamination Sequence
    if (gameOverType === 'contamination') {
        // 'censorship' stage does NOT render an overlay (or renders invisible one to allow viewing the page corruption)
        // 'blackout' and 'expulsion' render overlays.

        if (soilStage === 'censorship') {
            return (
                // Transparent overlay just to block interaction? User didn't specify interaction block but implied "User sees page".
                // Blocking interaction is probably safer.
                // Also we need global styles for noise or visual effects if wanted, but request just said "Text turns to square".
                <div className="fixed inset-0 z-[9999] bg-transparent cursor-none" onClick={(e) => e.stopPropagation()} />
            );
        }

        return (
            <div className="fixed inset-0 z-[9999] bg-[#FFC400] text-[#D80000] font-gungsu flex items-center justify-center overflow-hidden">
                <style>{`
                    .font-gungsu { font-family: "Gungsuh", "Batang", "Gungsu", serif; }
                `}</style>

                {soilStage === 'expulsion' && (
                    <div className="relative">
                        {/* '退' Character: Talisman Style */}
                        <span className="text-[20rem] md:text-[30rem] leading-none select-none">
                            {CONTAMINATION_CONFIG.TEXT.EXPULSION_CHAR}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
