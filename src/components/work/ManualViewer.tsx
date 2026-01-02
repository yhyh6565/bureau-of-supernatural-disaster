import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShieldAlert, Ban, Info, BookOpen } from 'lucide-react';
import { DataManager } from '@/data/dataManager';
import { Manual } from '@/types/haetae';
import { DANGER_LEVEL_STYLE } from '@/constants/haetae';

interface ManualViewerProps {
    manualId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ManualViewer = ({ manualId, open, onOpenChange }: ManualViewerProps) => {
    const [manual, setManual] = useState<Manual | null>(null);

    useEffect(() => {
        if (manualId && open) {
            const foundManual = DataManager.getManual(manualId);
            setManual(foundManual || null);
        }
    }, [manualId, open]);

    if (!manual) return null;

    const dangerStyle = DANGER_LEVEL_STYLE[manual.severity];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${dangerStyle.bgClass} ${dangerStyle.textClass}`}>
                            {manual.severity}
                        </Badge>
                        <Badge variant="outline">등급 {manual.clearanceLevel}</Badge>
                    </div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        {manual.title}
                    </DialogTitle>
                    <DialogDescription>
                        최종 업데이트: {new Date(manual.lastUpdated).toLocaleDateString()}
                        {manual.id && <span className="ml-2 font-mono text-xs opacity-50">ID: {manual.id}</span>}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {/* 식별 징후 */}
                        <section>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                                <Info className="w-4 h-4" />
                                식별 징후
                            </h4>
                            <div className="p-4 bg-muted/50 rounded-md text-sm leading-relaxed">
                                {manual.content.identification}
                            </div>
                        </section>

                        <Separator />

                        {/* 즉각 대응 행동 */}
                        <section>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-success">
                                <ShieldAlert className="w-4 h-4" />
                                즉각 대응 행동
                            </h4>
                            <ul className="grid gap-2">
                                {(manual.content.immediateAction || []).map((action, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm">
                                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-green-500/20 rounded-full text-xs font-bold text-green-700 dark:text-green-400">
                                            {idx + 1}
                                        </span>
                                        <span className="text-foreground/90">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 금기 사항 - 중요! */}
                        <section>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-destructive">
                                <Ban className="w-4 h-4" />
                                금기 사항
                            </h4>
                            <div className="border border-destructive/50 bg-destructive/10 rounded-md p-4">
                                <ul className="space-y-2">
                                    {(manual.content.taboo || []).map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm font-medium text-destructive dark:text-red-400">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <Separator />

                        {/* 봉인법 및 사후 처리 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {manual.containmentMethod && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">봉인/대처법</h4>
                                    <p className="text-sm border p-3 rounded-md bg-background">{manual.containmentMethod}</p>
                                </div>
                            )}
                            {manual.aftermath && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">사후 처리</h4>
                                    <p className="text-sm border p-3 rounded-md bg-background">{manual.aftermath}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
