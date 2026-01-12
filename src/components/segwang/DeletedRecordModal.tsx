'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBureauStore } from '@/store/bureauStore';

interface DeletedRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
}

type Phase = 'search' | 'warning' | 'glitch' | 'recovery' | 'loading' | 'transition';

export function DeletedRecordModal({ isOpen, onClose, searchQuery }: DeletedRecordModalProps) {
    const { setMode } = useBureauStore();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<Phase>('search');
    const [message, setMessage] = useState('해당 기록은 존재하지 않습니다');
    const [progress, setProgress] = useState(0);

    // Initial reset when opening
    useEffect(() => {
        if (isOpen) {
            setPhase('search');
            setMessage('해당 기록은 존재하지 않습니다');
            setProgress(0);
        }
    }, [isOpen]);

    const handleViewDeletedRecord = async () => {
        // Phase 2-1: Initial Message (3s)
        setPhase('warning');
        await sleep(3000);

        // Phase 2-2: Glitch Effect (2s)
        setPhase('glitch');
        let glitchinterval = setInterval(() => {
            setMessage((prev) => glitchText(prev));
        }, 100);
        await sleep(2000);
        clearInterval(glitchinterval);

        // Phase 2-3: Text Change (Partial Recovery)
        setPhase('recovery');
        setMessage('해당 █록█ █재합니다');
        await sleep(1500);

        // Phase 2-4: Final Message
        setMessage('해당 기록은 존재합니다');
        await sleep(1500);

        // Phase 2-5: Loading
        setPhase('loading');
        // Progress simulation
        for (let i = 0; i <= 47; i++) {
            setProgress(i);
            await sleep(50);
        }
        await sleep(1000);

        // Phase 3: Transition (3초 동안 "접속 중... 세광특별시 지부" 표시)
        setPhase('transition');
        await sleep(3000);

        // Close modal first
        onClose();

        // Wait for dialog close animation, then switch mode and navigate
        setTimeout(() => {
            setMode('segwang');
            navigate('/');
        }, 400);
    };

    const glitchText = (text: string) => {
        return text.split('').map(char =>
            Math.random() > 0.7 ? '█' : char
        ).join('');
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(
                "sm:max-w-md border-2",
                phase === 'search' ? "border-red-900 bg-background" : "border-red-600 bg-black text-red-500 font-mono",
                (phase === 'transition' || phase === 'glitch') && "animate-pulse"
            )}>
                {phase === 'search' && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-2 text-center border-b border-dashed border-red-900/30 pb-4">
                            <div className="w-full bg-red-950/20 text-red-600 py-1 text-xs font-mono mb-2">
                                [SYSTEM WARNING: ACCESS RESTRICTED]
                            </div>
                            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <Lock className="w-5 h-5" /> 접근 제한 구역
                            </h2>
                        </div>

                        <div className="space-y-4 py-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">검색어:</span>
                                <span className="font-mono font-bold">"{searchQuery}"</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">결과:</span>
                                <span className="text-red-600 font-bold">0건 (삭제됨)</span>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-md border border-red-200 text-xs space-y-2 text-muted-foreground">
                                <p className="font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> 경고
                                </p>
                                <p>해당 검색어는 국가기밀법 제██조에 의해 접근이 제한되어 있습니다.</p>
                                <p>이 기록은 [기억 소각 프로토콜]에 의해 영구 삭제되었습니다.</p>
                            </div>

                            <div className="bg-black/5 p-3 rounded text-xs font-mono space-y-1">
                                <div className="text-muted-foreground">[복구된 캐시 데이터 발견]</div>
                                <div>최종 백업: 20██.05.04 23:47:23</div>
                                <div>데이터 무결성: 47%</div>
                                <div className="text-red-500">복구 가능성: 낮음</div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                                취소
                            </Button>
                            <Button
                                variant="destructive"
                                className="bg-red-900 hover:bg-red-800"
                                onClick={handleViewDeletedRecord}
                            >
                                <FileX className="w-4 h-4 mr-2" />
                                삭제된 기록 보기
                            </Button>
                        </div>
                    </div>
                )}

                {phase !== 'search' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-8 font-mono min-h-[300px]">
                        {/* Terminal Box UI */}
                        <div className={cn(
                            "w-full border p-6 relative overflow-hidden transition-all duration-300",
                            phase === 'transition' ? "border-red-500 bg-red-950/30" : "border-red-800 bg-black"
                        )}>
                            {/* CRT Line Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]" />

                            <div className="text-center space-y-4 relative z-20">
                                <div className={cn(
                                    "text-xl tracking-widest transition-all duration-100",
                                    (phase === 'glitch' || phase === 'transition') && "translate-x-[1px] text-red-400 blur-[0.5px]"
                                )}>
                                    {message}
                                </div>

                                {(phase === 'loading' || phase === 'transition') && (
                                    <div className="space-y-2 mt-8">
                                        <div className="text-xs text-red-700 text-left w-full mb-1">DATA RECOVERY IN PROGRESS...</div>
                                        <div className="h-2 w-full bg-red-950/50 border border-red-900">
                                            <div
                                                className="h-full bg-red-600 transition-all duration-75"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-red-600">
                                            <span className="animate-pulse">▓▓▓▓▓▓▓░░░░░░░░</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="text-xs text-red-500/70 pt-2 border-t border-red-900/30 mt-2">
                                            경고: 데이터 무결성 낮음<br />
                                            손상된 파일 복원 중
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {phase === 'transition' && (
                            <div className="text-red-500 text-sm animate-pulse">
                                접속 중... 세광특별시 지부
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
