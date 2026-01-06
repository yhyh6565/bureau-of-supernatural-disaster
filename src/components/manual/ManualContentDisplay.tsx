import { Manual } from '@/types/haetae';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShieldAlert, Ban, Info } from 'lucide-react';

interface ManualContentDisplayProps {
    manual: Manual;
}

export const ManualContentDisplay = ({ manual }: ManualContentDisplayProps) => {
    // [NEW] Prose content support
    if (manual.body) {
        return (
            <div className="py-4 px-1">
                <div className="text-sm leading-8 text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                    {manual.body}
                </div>
            </div>
        );
    }

    if (!manual.content) return <div className="p-4 text-center text-muted-foreground">내용 없음</div>;

    return (
        <div className="space-y-8 py-4 px-1">
            {/* 식별 징후 */}
            <section>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground select-none">
                    <Info className="w-4 h-4" />
                    식별 징후
                </h4>
                <div className="p-4 bg-muted/50 rounded-md text-sm leading-relaxed border border-border/50">
                    {manual.content.identification}
                </div>
            </section>

            <Separator />

            {/* 즉각 대응 행동 */}
            <section>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-500 select-none">
                    <ShieldAlert className="w-4 h-4" />
                    즉각 대응 행동
                </h4>
                <ul className="grid gap-3">
                    {(manual.content.immediateAction || []).map((action, idx) => (
                        <li key={idx} className="flex items-start gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-lg text-sm group hover:bg-green-500/10 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-500/20 rounded-full text-xs font-bold text-green-700 dark:text-green-400 select-none">
                                {idx + 1}
                            </span>
                            <div className="flex-1 pt-0.5">
                                {action}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 금기 사항 - 중요! */}
            <section>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive select-none">
                    <Ban className="w-4 h-4" />
                    금기 사항
                </h4>
                <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-5">
                    <ul className="space-y-4">
                        {(manual.content.taboo || []).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm font-medium text-destructive dark:text-red-400">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    {item}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <Separator />

            {/* 봉인법 및 사후 처리 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground select-none">봉인/대처법</h4>
                    {manual.containmentMethod ? (
                        <div className="text-sm border p-4 rounded-md bg-background shadow-sm">
                            {manual.containmentMethod}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-2">정보 없음</div>
                    )}
                </div>
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground select-none">사후 처리</h4>
                    {manual.aftermath ? (
                        <div className="text-sm border p-4 rounded-md bg-background shadow-sm">
                            {manual.aftermath}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-2">정보 없음</div>
                    )}
                </div>
            </div>
        </div>
    );
};
