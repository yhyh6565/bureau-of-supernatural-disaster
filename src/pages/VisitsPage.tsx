import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { MOCK_LOCATIONS } from '@/data/extendedMockData';
import { MapPin, Clock, AlertCircle, CalendarIcon } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

// 예약된 슬롯 (더미)
const RESERVED_SLOTS: Record<string, string[]> = {
  '2025-12-31': ['10:00', '14:00'],
  '2026-01-02': ['09:00', '11:00', '15:00'],
};

export function VisitsPage() {
  const [selectedLocation, setSelectedLocation] = useState<typeof MOCK_LOCATIONS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      toast({
        title: '입력 오류',
        description: '날짜, 시간, 사유를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedLocation?.requiresApproval) {
      toast({
        title: '결재 요청 완료',
        description: `"${selectedLocation.name}" 방문 신청이 결재 상신되었습니다.`,
      });
    } else {
      toast({
        title: '예약 완료',
        description: `${format(selectedDate, 'M월 d일', { locale: ko })} ${selectedTime} "${selectedLocation?.name}" 방문이 예약되었습니다.`,
      });
    }
    
    setSelectedLocation(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setReason('');
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return TIME_SLOTS;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const reserved = RESERVED_SLOTS[dateKey] || [];
    return TIME_SLOTS.filter(slot => !reserved.includes(slot));
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold">방문 신청</h1>
        <p className="text-sm text-muted-foreground">시설 방문 예약을 신청합니다.</p>
      </div>

      <Card className="card-gov pb-12">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            방문 가능 장소
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_LOCATIONS.map((location) => (
              <div
                key={location.id}
                className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{location.imageEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{location.name}</span>
                      {location.requiresApproval && (
                        <Badge variant="outline" className="text-xs text-warning border-warning">
                          결재필요
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>운영시간: {location.operatingHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 예약 모달 */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedLocation?.imageEmoji}</span>
              {selectedLocation?.name} 방문 신청
            </DialogTitle>
            <DialogDescription>{selectedLocation?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedLocation?.requiresApproval && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>이 장소는 결재 승인 후 방문 가능합니다.</span>
              </div>
            )}

            {/* 날짜 선택 */}
            <div className="space-y-2">
              <Label>방문 날짜 <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'yyyy년 M월 d일', { locale: ko }) : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 시간 선택 */}
            <div className="space-y-2">
              <Label>방문 시간 <span className="text-destructive">*</span></Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSlots().map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDate && getAvailableSlots().length < TIME_SLOTS.length && (
                <p className="text-xs text-muted-foreground">
                  ※ 일부 시간대는 이미 예약되어 선택할 수 없습니다.
                </p>
              )}
            </div>

            {/* 사유 입력 */}
            <div className="space-y-2">
              <Label>방문 사유 <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="방문 사유를 입력하세요..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLocation(null)}>취소</Button>
            <Button onClick={handleSubmit}>
              {selectedLocation?.requiresApproval ? '결재 요청' : '예약 신청'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default VisitsPage;
