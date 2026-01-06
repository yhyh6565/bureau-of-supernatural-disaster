import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShieldAlert, Ban, Info, BookOpen } from 'lucide-react';
import { DataManager } from '@/data/dataManager';
import { ManualContentDisplay } from '@/components/manual/ManualContentDisplay';
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

    const dangerStyle = DANGER_LEVEL_STYLE[manual.severity] || {
        bgClass: 'bg-gray-500',
        textClass: 'text-white',
        description: '정보 없음'
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${dangerStyle.bgClass} ${dangerStyle.textClass}`}>
                            {manual.severity}
                        </Badge>
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

                <div className="flex-1 overflow-y-auto pr-4">
                    <ManualContentDisplay manual={manual} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
