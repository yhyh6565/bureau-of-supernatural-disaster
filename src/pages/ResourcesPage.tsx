import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
    Equipment,
    InspectionRequest,
    VisitLocation
} from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import { useWork } from '@/contexts/WorkContext';
import { INSPECTION_TYPES } from '@/constants/haetae';
import {
    Package,
    ShoppingCart,
    Search,
    AlertTriangle,
    Key,
    Home,
    Plus,
    Stethoscope,
    MapPin,
    Clock,
    CalendarIcon,
    AlertCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format, isBefore } from 'date-fns';
import { startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Equipment Components ---

interface EquipmentCardProps {
    item: Equipment;
    onSelect: (item: Equipment) => void;
}

function EquipmentCard({ item, onSelect }: EquipmentCardProps) {
    const { rentals } = useResource();

    // 내가 빌린 같은 이름의 장비 개수 계산 (상태가 '정상'인 것만, 수량 합산)
    const myRentalCount = rentals
        .filter(r =>
            r.equipmentName === item.name &&
            (r.status === '정상' || r.status === '연체')
        )
        .reduce((sum, r) => sum + (r.quantity || 1), 0);

    // 표시 재고 = 기본 재고 - 내가 빌린 수량
    const displayStock = Math.max(0, item.availableStock - myRentalCount);

    const getIcon = (category: string) => {
        if (category === '대여') return <Key className="w-8 h-8 opacity-50 mb-2" />;
        return <ShoppingCart className="w-8 h-8 opacity-50 mb-2" />;
    };

    return (
        <div
            onClick={() => onSelect(item)}
            className="border border-border rounded-sm p-4 hover:bg-accent/50 cursor-pointer transition-colors flex flex-col items-center text-center"
        >
            {getIcon(item.category)}
            <h3 className="font-bold mb-1">{item.name}</h3>
            <div className="flex gap-1 mb-2">
                <Badge variant={item.category === '대여' ? 'default' : 'secondary'} className="text-xs">
                    {item.category}
                </Badge>
                {item.requiresApproval && (
                    <Badge variant="outline" className="text-xs border-destructive text-destructive">
                        승인필요
                    </Badge>
                )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {item.description}
            </p>
            <div className="mt-auto text-xs font-mono text-muted-foreground">
                재고: {displayStock} / {item.totalStock}
            </div>
        </div>
    );
}

// --- Inspection Form ---

function InspectionRequestForm({ onClose, onSubmit }: {
    onClose: () => void;
    onSubmit: (type: '정기검사' | '정밀검사' | '긴급검사', date: Date, symptoms: string) => void;
}) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [symptoms, setSymptoms] = useState('');

    const handleSubmit = () => {
        if (selectedType && date) {
            onSubmit(selectedType as any, new Date(date), symptoms);
            toast({
                title: '검사 신청 완료',
                description: '오염 검사 신청이 접수되었습니다. 의료팀의 승인 후 일정이 확정됩니다.',
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

// --- Visit Constants ---

// 운영시간 문자열에서 시간 슬롯 배열 생성
const parseOperatingHours = (operatingHours: string): string[] => {
    const match = operatingHours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (!match) return [];

    const startHour = parseInt(match[1]);
    const endHour = parseInt(match[3]);
    const slots: string[] = [];

    // 마지막 시간은 운영 종료 1시간 전까지만 예약 가능
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
};

// 세션 스토리지 키
const RESERVATION_STORAGE_KEY = 'haetae_reservations';

// 시설별 예약 슬롯 생성 (세션 스토리지에 캐싱)
const getOrCreateReservedSlots = (locationId: string, availableSlots: string[]): Record<string, string[]> => {
    const storageKey = `${RESERVATION_STORAGE_KEY}_${locationId}`;

    // 세션 스토리지에서 기존 예약 확인
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // 파싱 실패 시 새로 생성
        }
    }

    // 새로 예약 슬롯 생성
    const slots: Record<string, string[]> = {};
    const today = new Date();

    // 오늘부터 14일간 랜덤 예약 슬롯 생성
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        // 날짜별로 1~3개의 랜덤 시간대 예약 (운영시간 내에서만)
        const numReserved = Math.floor(Math.random() * 3) + 1;
        const reserved: string[] = [];
        for (let j = 0; j < numReserved; j++) {
            if (availableSlots.length > 0) {
                const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
                if (!reserved.includes(randomSlot)) {
                    reserved.push(randomSlot);
                }
            }
        }
        if (reserved.length > 0) {
            slots[dateKey] = reserved;
        }
    }

    // 세션 스토리지에 저장
    sessionStorage.setItem(storageKey, JSON.stringify(slots));
    return slots;
};


// --- Main Page Component ---

export function ResourcesPage() {
    const { agent } = useAuth();
    const { addRental } = useResource();
    const resourceContext = useResource();
    const { addVisitSchedule, addApproval, addInspectionRequest, inspectionRequests } = useWork();

    // Tabs
    const [activeTab, setActiveTab] = useState('equipment');

    // Equipment State
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [rentalDays, setRentalDays] = useState('1');
    const [quantity, setQuantity] = useState('1');
    const [equipmentReason, setEquipmentReason] = useState('');

    // Visit State
    const [selectedLocation, setSelectedLocation] = useState<VisitLocation | null>(null);
    const [visitDate, setVisitDate] = useState<Date>();
    const [visitTime, setVisitTime] = useState<string>('');
    const [visitReason, setVisitReason] = useState('');

    // Inspection State
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);

    // Data Loading
    const allEquipment = DataManager.getEquipment();
    const locations = DataManager.getLocations();
    // const inspections = DataManager.getInspectionRequests(agent); // Replaced by context

    // Equipment Logic
    const filteredEquipment = allEquipment.filter(item =>
        item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.description.includes(equipmentSearch)
    );
    const rentalItems = filteredEquipment.filter(item => item.category === '대여');
    const supplyItems = filteredEquipment.filter(item => item.category === '지급');

    const handleEquipmentRequest = () => {
        if (!equipmentReason.trim()) {
            toast({ title: '입력 오류', description: '사유를 입력해주세요.', variant: 'destructive' });
            return;
        }

        if (!selectedEquipment) return;

        const isApprovalRequired = selectedEquipment.requiresApproval;

        if (isApprovalRequired) {
            // 결재 문서 생성
            addApproval({
                type: '장비품의서',
                title: `${selectedEquipment.name} ${selectedEquipment.category} 신청 건`,
                content: `품목: ${selectedEquipment.name}\n수량/기간: ${selectedEquipment.category === '대여' ? rentalDays + '일' : quantity + '개'}\n사유: ${equipmentReason}`,
                status: '결재대기',
                createdBy: agent?.id || 'unknown',
                createdByName: agent?.name || '알 수 없음',
                approver: 'HMU-301', // 임시: 해금 팀장
            });

            toast({
                title: '결재 상신 완료',
                description: `"${selectedEquipment.name}" 신청에 대한 결재가 상신되었습니다.`,
            });
        } else {
            // 즉시 대여/지급 처리
            // 대여인 경우 rentalDays, 지급인 경우 quantity 사용 (단, addRental 3번째 인자로 수량 전달)
            const qty = parseInt(quantity);
            const days = parseInt(rentalDays);

            if (selectedEquipment.category === '대여') {
                // 대여는 수량 1 고정 (UI에 수량 선택이 없음) - 추후 필요시 UI 추가
                addRental(selectedEquipment, days, 1);
            } else {
                // 지급은 기간 0, 수량 qty
                addRental(selectedEquipment, 0, qty);
            }

            toast({
                title: '신청 완료',
                description: `"${selectedEquipment.name}" ${selectedEquipment.category === '대여' ? '대여' : '지급'} 신청이 완료되었습니다.`,
            });
        }

        setSelectedEquipment(null);
        setEquipmentReason('');
        setQuantity('1');
        setRentalDays('1');
    };

    // Visit Logic
    const handleVisitSubmit = () => {
        if (!visitDate || !visitTime || !visitReason.trim()) {
            toast({ title: '입력 오류', description: '모든 정보를 입력해주세요.', variant: 'destructive' });
            return;
        }

        if (!selectedLocation) return;

        const isApprovalRequired = selectedLocation.requiresApproval;

        if (isApprovalRequired) {
            addApproval({
                type: '방문품의서',
                title: `${selectedLocation.name} 방문 신청 건`,
                content: `장소: ${selectedLocation.name}\n일시: ${format(visitDate, 'yyyy-MM-dd')} ${visitTime}\n사유: ${visitReason}`,
                status: '결재대기',
                createdBy: agent?.id || 'unknown',
                createdByName: agent?.name || '알 수 없음',
                approver: 'HMU-301', // 임시
            });

            toast({
                title: '결재 상신 완료',
                description: `"${selectedLocation.name}" 방문 신청에 대한 결재가 상신되었습니다.`,
            });
        } else {
            // 즉시 예약 (일정 추가)
            // 날짜와 시간을 합쳐서 Date 객체 생성
            const [hours, minutes] = visitTime.split(':').map(Number);
            const scheduleDate = new Date(visitDate);
            scheduleDate.setHours(hours, minutes, 0, 0);

            addVisitSchedule(selectedLocation, scheduleDate);

            toast({
                title: '예약 완료',
                description: `"${selectedLocation.name}" 방문 예약이 완료되었습니다.`,
            });
        }

        setSelectedLocation(null);
        setVisitDate(undefined);
        setVisitTime('');
        setVisitReason('');
    };

    // 선택된 시설의 운영시간 기반 슬롯 계산
    const getLocationTimeSlots = () => {
        if (!selectedLocation) return [];
        return parseOperatingHours(selectedLocation.operatingHours);
    };

    const getAvailableSlots = () => {
        if (!selectedLocation) return [];
        const locationSlots = getLocationTimeSlots();
        if (!visitDate) return locationSlots;

        const dateKey = format(visitDate, 'yyyy-MM-dd');
        const reservedSlots = getOrCreateReservedSlots(selectedLocation.id, locationSlots);
        const reserved = reservedSlots[dateKey] || [];

        // 오늘인 경우 현재 시간 이전 슬롯 제외
        const now = new Date();
        const isToday = format(now, 'yyyy-MM-dd') === dateKey;

        return locationSlots.filter(slot => {
            if (reserved.includes(slot)) return false;
            if (isToday) {
                const [hour] = slot.split(':').map(Number);
                if (hour <= now.getHours()) return false;
            }
            return true;
        });
    };

    const isDateDisabled = (date: Date) => {
        return isBefore(date, startOfDay(new Date()));
    };

    return (
        <MainLayout>


            <Tabs defaultValue="equipment" className="pb-12" onValueChange={setActiveTab}>
                <TabsList className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 w-full">
                    <TabsTrigger value="equipment" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">장비 관리</span>
                        <span className="sm:hidden">장비</span>
                    </TabsTrigger>
                    <TabsTrigger value="facilities" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">시설 예약</span>
                        <span className="sm:hidden">시설</span>
                    </TabsTrigger>
                    <TabsTrigger value="inspection" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">오염 검사</span>
                        <span className="sm:hidden">검사</span>
                    </TabsTrigger>
                    <TabsTrigger value="dormitory" className="gap-1 sm:gap-2 text-xs sm:text-sm" disabled>
                        <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">기숙사</span>
                        <span className="sm:hidden">기숙사</span>
                    </TabsTrigger>
                </TabsList>

                {/* --- Equipment Tab --- */}
                <TabsContent value="equipment">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="장비 이름 또는 용도 검색..."
                            value={equipmentSearch}
                            onChange={(e) => setEquipmentSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="grid gap-6 sm:gap-8">
                        <section>
                            <h2 className="text-base sm:text-lg font-bold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    대여 장비
                                </div>
                                <span className="text-xs font-normal text-muted-foreground">
                                    작전 종료 후 반드시 반납해야 합니다.
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {rentalItems.map(item => (
                                    <EquipmentCard key={item.id} item={item} onSelect={setSelectedEquipment} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    지급 물품
                                </div>
                                <span className="text-xs font-normal text-muted-foreground">
                                    소모품으로 별도 반납 절차가 없습니다.
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {supplyItems.map(item => (
                                    <EquipmentCard key={item.id} item={item} onSelect={setSelectedEquipment} />
                                ))}
                            </div>
                        </section>
                    </div>
                </TabsContent>

                {/* --- Facilities Tab (Visits) --- */}
                <TabsContent value="facilities">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setSelectedLocation(location)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                                        <MapPin className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{location.name}</span>
                                            {location.requiresApproval && (
                                                <Badge variant="outline" className="text-xs text-warning border-warning">
                                                    결재필요
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{location.operatingHours}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* --- Inspection Tab --- */}
                <TabsContent value="inspection">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold">오염 검사 내역</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                정기 및 필요에 따른 수시 오염도 검사 내역입니다.
                            </p>
                        </div>
                        <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 w-full sm:w-auto">
                                    <Plus className="w-4 h-4" />
                                    검사 신청
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>오염 검사 신청</DialogTitle>
                                    <DialogDescription>
                                        검사 목적과 희망 일정을 입력해 주세요.
                                    </DialogDescription>
                                </DialogHeader>
                                <InspectionRequestForm
                                    onClose={() => setIsInspectionOpen(false)}
                                    onSubmit={addInspectionRequest}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="card-gov">
                        <CardContent className="p-0">
                            <div className="border border-border rounded-sm overflow-hidden min-h-[200px]">
                                {/* Desktop Table Header */}
                                <div className="hidden md:grid table-header-gov grid-cols-12 gap-2 p-3 text-sm">
                                    <div className="col-span-2 text-center">유형</div>
                                    <div className="col-span-2 text-center">상태</div>
                                    <div className="col-span-3 text-center">예정일</div>
                                    <div className="col-span-2 text-center">접수일</div>
                                    <div className="col-span-3">검사 결과</div>
                                </div>

                                {inspectionRequests.length > 0 ? (
                                    inspectionRequests.map((insp) => (
                                        <div key={insp.id} className="border-t border-border hover:bg-accent/50">
                                            {/* Mobile Card Layout */}
                                            <div className="md:hidden p-3 space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium text-sm">{insp.type}</span>
                                                    <Badge variant={
                                                        insp.status === '완료' ? 'default' :
                                                            insp.status === '접수' ? 'secondary' : 'outline'
                                                    } className="text-xs">
                                                        {insp.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">예정일</span>
                                                        <span>{format(new Date(insp.scheduledDate), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">접수일</span>
                                                        <span>{format(new Date(insp.createdAt), 'MM.dd', { locale: ko })}</span>
                                                    </div>
                                                    {insp.result && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">결과</span>
                                                            <span>{insp.result}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Desktop Grid Layout */}
                                            <div className="hidden md:grid grid-cols-12 gap-2 p-3 items-center text-sm">
                                                <div className="col-span-2 text-center font-medium">{insp.type}</div>
                                                <div className="col-span-2 text-center">
                                                    <Badge variant={
                                                        insp.status === '완료' ? 'default' :
                                                            insp.status === '접수' ? 'secondary' : 'outline'
                                                    }>
                                                        {insp.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3 text-center">
                                                    {format(new Date(insp.scheduledDate), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                                </div>
                                                <div className="col-span-2 text-center text-muted-foreground">
                                                    {format(new Date(insp.createdAt), 'MM.dd', { locale: ko })}
                                                </div>
                                                <div className="col-span-3 truncate text-muted-foreground">
                                                    {insp.result || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full py-12">
                                        <Stethoscope className="w-8 h-8 opacity-20 mb-2" />
                                        <p>검사 내역이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dormitory">
                    <Card className="card-gov">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                기숙사 입주/연장 신청
                            </CardTitle>
                            <CardDescription>
                                현재 기숙사 시스템 준비 중입니다. 당직실을 이용해 주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-sm">
                                시스템 점검 중
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- Modals --- */}

            {/* Equipment Request Modal */}
            <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEquipment?.name} {selectedEquipment?.category} 신청</DialogTitle>
                        <DialogDescription>{selectedEquipment?.description}</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="flex justify-between text-sm p-4 bg-muted/50 rounded-sm">
                            <span>남은 수량</span>
                            <span className="font-mono font-bold">
                                {(() => {
                                    // Calculate stock dynamically based on current rentals in context
                                    const myCount = resourceContext.rentals
                                        .filter(r =>
                                            r.equipmentName === selectedEquipment?.name &&
                                            (r.status === '정상' || r.status === '연체')
                                        )
                                        .reduce((sum, r) => sum + (r.quantity || 1), 0);

                                    const stock = Math.max(0, (selectedEquipment?.availableStock || 0) - myCount);
                                    return `${stock} / ${selectedEquipment?.totalStock}`;
                                })()}
                            </span>
                        </div>

                        {selectedEquipment?.requiresApproval && (
                            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>이 장비는 결재 승인 후 대여 가능합니다.</span>
                            </div>
                        )}

                        {selectedEquipment?.category === '대여' && (
                            <div className="space-y-2">
                                <Label>대여 기간 <span className="text-destructive">*</span></Label>
                                <div className="flex gap-2">
                                    {[1, 3, 7, 14, 30].map(day => (
                                        <Button
                                            key={day}
                                            variant={rentalDays === day.toString() ? "default" : "outline"}
                                            className="flex-1 h-8 text-xs"
                                            onClick={() => setRentalDays(day.toString())}
                                        >
                                            {day}일
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedEquipment?.category === '지급' && (
                            <div className="space-y-2">
                                <Label>수량 <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>신청 사유 <span className="text-destructive">*</span></Label>
                            <Textarea
                                placeholder="사용 목적을 구체적으로 입력하세요."
                                value={equipmentReason}
                                onChange={(e) => setEquipmentReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedEquipment(null)}>취소</Button>
                        <Button onClick={handleEquipmentRequest}>
                            {selectedEquipment?.requiresApproval ? '결재 요청' : '신청하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Facility Reservation Modal */}
            <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                                <MapPin className="w-4 h-4" />
                            </span>
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

                        {/* Date Selection */}
                        <div className="space-y-2">
                            <Label>방문 날짜 <span className="text-destructive">*</span></Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !visitDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {visitDate ? format(visitDate, 'yyyy년 M월 d일', { locale: ko }) : '날짜 선택'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={visitDate}
                                        onSelect={setVisitDate}
                                        disabled={isDateDisabled}
                                        initialFocus
                                        className={cn("p-3 pointer-events-auto")}
                                        locale={ko}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-2">
                            <Label>방문 시간 <span className="text-destructive">*</span></Label>
                            <Select value={visitTime} onValueChange={setVisitTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="방문 시간 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableSlots().length > 0 ? (
                                        getAvailableSlots().map((slot) => (
                                            <SelectItem key={slot} value={slot}>
                                                {slot}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            {visitDate ? "예약 가능한 시간이 없습니다." : "날짜를 먼저 선택해주세요."}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>방문 목적 <span className="text-destructive">*</span></Label>
                            <Textarea
                                placeholder="방문 목적을 구체적으로 입력하세요."
                                value={visitReason}
                                onChange={(e) => setVisitReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedLocation(null)}>취소</Button>
                        <Button onClick={handleVisitSubmit}>
                            {selectedLocation?.requiresApproval ? '결재 요청' : '예약하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </MainLayout>
    );
}

export default ResourcesPage;
