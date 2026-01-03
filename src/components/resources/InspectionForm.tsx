import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { INSPECTION_TYPES } from '@/constants/haetae';

interface InspectionFormProps {
    onClose: () => void;
    onSubmit: (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string) => void;
}

export function InspectionForm({ onClose, onSubmit }: InspectionFormProps) {
    const { decreaseContamination } = useUser();
    const [selectedType, setSelectedType] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [symptoms, setSymptoms] = useState('');

    const handleSubmit = () => {
        if (selectedType && date) {
            onSubmit(selectedType as '정기검사' | '정밀검사' | '긴급검사', new Date(date), symptoms);
            decreaseContamination(5); // Reduce contamination by 5%
            toast({
                title: '검사 신청 완료',
                description: '오염 검사 신청이 접수되었습니다. (정신 오염도 5% 감소)',
            });
            onClose();
        }
    };

    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>검사 유형</Label>
                <Select onValueChange={setSelectedType}>
                    <SelectTrigger>
                        <SelectValue placeholder="검사 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        {INSPECTION_TYPES.map((type) => (
                            <SelectItem key={type.name} value={type.name}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedType && (
                    <p className="text-xs text-muted-foreground">
                        {INSPECTION_TYPES.find(t => t.name === selectedType)?.description}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label>희망 검사일</Label>
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className="space-y-2">
                <Label>증상 및 특이사항</Label>
                <Textarea
                    placeholder="최근 겪은 이상 증상이나 특이사항을 상세히 기술해 주세요."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="h-24"
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>취소</Button>
                <Button onClick={handleSubmit} disabled={!selectedType || !date}>신청</Button>
            </div>
        </div>
    );
}
