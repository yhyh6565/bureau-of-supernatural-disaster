import React, { useState, useEffect } from 'react';

interface GlitchWrapperProps {
    children: React.ReactNode;
    intensity?: 'low' | 'medium' | 'high';
    trigger?: boolean;
    className?: string; // 추가적인 스타일링을 위해
}

export function GlitchWrapper({ children, intensity = 'low', trigger = true, className = '' }: GlitchWrapperProps) {
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (!trigger) return;

        const triggerGlitch = () => {
            setIsGlitching(true);
            const duration = Math.random() * 200 + 50; // 50ms ~ 250ms
            setTimeout(() => setIsGlitching(false), duration);
        };

        const intervalTime = intensity === 'high' ? 1000 : intensity === 'medium' ? 3000 : 7000;
        const randomInterval = Math.random() * intervalTime + intervalTime / 2;

        const interval = setInterval(triggerGlitch, randomInterval);

        return () => clearInterval(interval);
    }, [intensity, trigger]);

    return (
        <div className={`relative ${className}`}>
            <div className={`relative ${isGlitching ? 'opacity-50' : 'opacity-100'} transition-opacity duration-75`}>
                {children}
            </div>

            {isGlitching && (
                <>
                    <div
                        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50 mix-blend-difference"
                        style={{
                            transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            clipPath: `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`
                        }}
                    >
                        {children}
                    </div>
                    <div
                        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen"
                        style={{
                            transform: `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`,
                            backgroundColor: 'rgba(0, 255, 255, 0.1)',
                            clipPath: `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`
                        }}
                    >
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}
