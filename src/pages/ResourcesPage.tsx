import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Equipment,
    VisitLocation
} from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuthStore } from '@/store/authStore';
import { useResourceStore } from '@/store/resourceStore';
import { useWorkData } from '@/hooks/useWorkData';
import { useGameStore } from '@/store/gameStore';
import {
    Package,
    Search,
    Key,
    Home,
    Stethoscope,
    MapPin,
    AlertCircle,
    CalendarIcon,
    Filter,
    ClipboardCheck
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
import { InspectionForm, parseOperatingHours, getOrCreateReservedSlots } from '@/components/resources';
import { Calendar } from '@/components/ui/calendar';

import { CensoredResourcesPage } from '@/components/segwang/CensoredResourcesPage';
import { useBureauStore } from '@/store/bureauStore';

export function ResourcesPage() {
    const { agent } = useAuthStore();
    const { addRental } = useResourceStore();
    // const resourceContext = useResource(); // Removed redundancy
    const { addVisitSchedule, addApproval, addInspectionRequest, inspectionRequests } = useWorkData();
    const { decreaseContamination } = useGameStore();
    const { mode } = useBureauStore();

    if (mode === 'segwang') {
        return <CensoredResourcesPage />;
    }

    // Tabs
    const [activeTab, setActiveTab] = useState('equipment');

    // Equipment State
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [rentalDays, setRentalDays] = useState('1');
    const [quantity, setQuantity] = useState('1');
    const [equipmentReason, setEquipmentReason] = useState('');
    const [selectedType, setSelectedType] = useState('전체');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            addApproval({
                type: '장비품의서',
                title: `${selectedEquipment.name} ${selectedEquipment.category} 신청 건`,
                content: `품목: ${selectedEquipment.name}\n수량/기간: ${selectedEquipment.category === '대여' ? rentalDays + '일' : quantity + '개'}\n사유: ${equipmentReason}`,
                status: '결재대기',
                createdBy: agent?.id || 'unknown',
                createdByName: agent?.name || '알 수 없음',
                approver: 'HMU-301',
            }, agent!);

            toast({
                title: '결재 상신 완료',
                description: `"${selectedEquipment.name}" 신청에 대한 결재가 상신되었습니다.`,
            });
        } else {
            const qty = parseInt(quantity);
            const days = parseInt(rentalDays);

            if (selectedEquipment.category === '대여') {
                addRental(selectedEquipment, days, 1);
            } else {
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

    // Visit Logic & Other handlers (Kept same logic, re-ordered UI)
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
                approver: 'HMU-301',
            }, agent!);
            if (selectedLocation.name === '용천 선녀탕') decreaseContamination(30);
            toast({ title: '결재 상신 완료', description: `"${selectedLocation.name}" 방문 신청 결재 상신됨.` });
        } else {
            const [hours, minutes] = visitTime.split(':').map(Number);
            const scheduleDate = new Date(visitDate);
            scheduleDate.setHours(hours, minutes, 0, 0);
            addVisitSchedule(selectedLocation, scheduleDate);
            if (selectedLocation.name === '용천 선녀탕') decreaseContamination(30);
            toast({ title: '예약 완료', description: `"${selectedLocation.name}" 방문 예약 완료.` });
        }
        setSelectedLocation(null);
        setVisitDate(undefined);
        setVisitTime('');
        setVisitReason('');
    };

    const getLocationTimeSlots = () => selectedLocation ? parseOperatingHours(selectedLocation.operatingHours) : [];
    const getAvailableSlots = () => {
        if (!selectedLocation) return [];
        const locationSlots = getLocationTimeSlots();
        if (!visitDate) return locationSlots;
        const dateKey = format(visitDate, 'yyyy-MM-dd');
        const reservedSlots = getOrCreateReservedSlots(selectedLocation.id, locationSlots);
        const reserved = reservedSlots[dateKey] || [];
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
    const isDateDisabled = (date: Date) => isBefore(date, startOfDay(new Date()));

    return (
        <MainLayout>
            <div className="space-y-6">
                <Tabs defaultValue="equipment" className="w-full" onValueChange={setActiveTab}>
                    {/* Full-width Tabs Style */}
                    <TabsList className="w-full flex md:grid md:grid-cols-4 h-auto md:h-11 bg-white border border-border/60 rounded-sm p-1 overflow-x-auto no-scrollbar gap-1 md:gap-0">
                        <TabsTrigger
                            value="equipment"
                            className="h-full gap-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all"
                        >
                            <Package className="w-4 h-4" />
                            장비 관리
                        </TabsTrigger>
                        <TabsTrigger
                            value="facilities"
                            className="h-full gap-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all"
                        >
                            <MapPin className="w-4 h-4" />
                            시설 예약
                        </TabsTrigger>
                        <TabsTrigger
                            value="inspection"
                            className="h-full gap-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all"
                        >
                            <Stethoscope className="w-4 h-4" />
                            오염 검사
                        </TabsTrigger>
                        <TabsTrigger
                            value="dormitory"
                            className="h-full gap-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm transition-all"
                            disabled
                        >
                            기숙사
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="equipment" className="mt-4 space-y-8">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="장비 이름 또는 용도 검색..."
                                value={equipmentSearch}
                                onChange={(e) => setEquipmentSearch(e.target.value)}
                                className="pl-12 h-11 text-base bg-white border-border/60 shadow-sm rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Rental Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Key className="w-6 h-6 text-primary fill-primary/20" />
                                        <h2 className="text-lg font-bold tracking-tight text-foreground">대여 장비</h2>
                                    </div>
                                    {/* Mobile Filter */}
                                    <div className="md:hidden">
                                        <Select value={selectedType} onValueChange={setSelectedType}>
                                            <SelectTrigger className="h-8 w-24 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['전체', '탐지', '제압', '방어', '은신', '특수'].map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="rounded-md border max-h-[240px] md:h-[400px] md:max-h-none overflow-auto relative bg-white">
                                    {/* Mobile View: Cards */}
                                    <div className="md:hidden divide-y divide-border/60">
                                        {rentalItems
                                            .filter(item => selectedType === '전체' || item.type === selectedType)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-4 space-y-2 cursor-pointer active:bg-muted/50 transition-colors"
                                                    onClick={() => setSelectedEquipment(item)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-medium text-foreground">{item.name}</h3>
                                                        {item.type && (
                                                            <Badge
                                                                className={cn(
                                                                    "font-normal h-5 px-1.5 text-[10px]",
                                                                    item.type === '탐지' && "bg-blue-100 text-blue-800",
                                                                    item.type === '제압' && "bg-red-100 text-red-800",
                                                                    item.type === '방어' && "bg-green-100 text-green-800",
                                                                    item.type === '은신' && "bg-gray-100 text-gray-800",
                                                                    item.type === '특수' && "bg-purple-100 text-purple-800",
                                                                )}
                                                                variant="outline"
                                                            >
                                                                {item.type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>

                                    {/* Desktop View: Table */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                                <TableRow>
                                                    <TableHead className="w-[120px]">이름</TableHead>
                                                    <TableHead className="w-[100px]">
                                                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-transparent">
                                                                    <span>분류</span>
                                                                    {selectedType !== '전체' && <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal h-5">{selectedType}</Badge>}
                                                                    <Filter className="ml-2 h-3.5 w-3.5" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="w-[200px] p-0">
                                                                <div className="p-1">
                                                                    {['전체', '탐지', '제압', '방어', '은신', '특수'].map((type) => (
                                                                        <Button
                                                                            key={type}
                                                                            variant="ghost"
                                                                            className={cn(
                                                                                "w-full justify-start font-normal h-8",
                                                                                selectedType === type && "bg-accent text-accent-foreground font-medium"
                                                                            )}
                                                                            onClick={() => {
                                                                                setSelectedType(type);
                                                                                setIsFilterOpen(false);
                                                                            }}
                                                                        >
                                                                            {type}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </TableHead>
                                                    <TableHead>설명</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rentalItems
                                                    .filter(item => selectedType === '전체' || item.type === selectedType)
                                                    .map((item) => (
                                                        <TableRow
                                                            key={item.id}
                                                            className="cursor-pointer hover:bg-muted/50"
                                                            onClick={() => setSelectedEquipment(item)}
                                                        >
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell>
                                                                {item.type && (
                                                                    <Badge
                                                                        className={cn(
                                                                            "font-normal",
                                                                            item.type === '탐지' && "bg-blue-100 text-blue-800 hover:bg-blue-200",
                                                                            item.type === '제압' && "bg-red-100 text-red-800 hover:bg-red-200",
                                                                            item.type === '방어' && "bg-green-100 text-green-800 hover:bg-green-200",
                                                                            item.type === '은신' && "bg-gray-100 text-gray-800 hover:bg-gray-200",
                                                                            item.type === '특수' && "bg-purple-100 text-purple-800 hover:bg-purple-200",
                                                                        )}
                                                                        variant="outline"
                                                                    >
                                                                        {item.type}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground truncate max-w-[200px]" title={item.description}>
                                                                {item.description}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </section>

                            {/* Supply Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6 text-primary fill-primary/20" />
                                    <h2 className="text-lg font-bold tracking-tight text-foreground">지급 물품</h2>
                                </div>

                                <div className="rounded-md border max-h-[240px] md:h-[400px] md:max-h-none overflow-auto relative bg-white">
                                    {/* Mobile View: Cards */}
                                    <div className="md:hidden divide-y divide-border/60">
                                        {supplyItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-4 space-y-2 cursor-pointer active:bg-muted/50 transition-colors"
                                                onClick={() => setSelectedEquipment(item)}
                                            >
                                                <h3 className="font-medium text-foreground">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop View: Table */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                                <TableRow>
                                                    <TableHead className="w-[160px]">이름</TableHead>
                                                    <TableHead>설명</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {supplyItems.map((item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => setSelectedEquipment(item)}
                                                    >
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell className="text-muted-foreground truncate max-w-[200px]" title={item.description}>
                                                            {item.description}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </TabsContent>

                    {/* Other tabs content simplified for length, logic remains same */}
                    <TabsContent value="facilities" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="group overflow-hidden bg-white border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => setSelectedLocation(location)}
                                >
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="font-bold text-lg">{location.name}</h3>
                                            </div>
                                            {location.requiresApproval && (
                                                <Badge variant="outline" className="text-xs border-destructive text-destructive bg-destructive/5 shrink-0">
                                                    결재필요
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {location.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            {location.operatingHours}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="inspection" className="mt-8 space-y-3.5">
                        <div className="flex flex-col gap-3 bg-muted/20 p-4 rounded-lg border border-border/40">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">오염 검사 내역</h2>
                                <p className="text-sm text-muted-foreground">정기 및 현장 복귀 후 필수 오염도 검사 기록을 확인 & 관리</p>
                            </div>
                            <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-sm w-full sm:w-auto h-9">
                                        + 검사 신청
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>오염 검사 신청</DialogTitle>
                                        <DialogDescription>검사 목적과 희망 일정을 입력해 주세요.</DialogDescription>
                                    </DialogHeader>
                                    <InspectionForm onClose={() => setIsInspectionOpen(false)} onSubmit={(t, d, s) => agent && addInspectionRequest(t, d, s, agent)} />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card className="border border-border/60 shadow-sm bg-white overflow-hidden min-h-[400px]">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/60 bg-gray-50/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <div className="col-span-2 text-center">유형</div>
                                    <div className="col-span-2 text-center">상태</div>
                                    <div className="col-span-3 text-center">예정일</div>
                                    <div className="col-span-2 text-center">접수일</div>
                                    <div className="col-span-3 text-center">검사 결과</div>
                                </div>

                                {inspectionRequests.length > 0 ? (
                                    <div className="divide-y divide-border/40">
                                        {inspectionRequests.map((insp) => (
                                            <div key={insp.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors text-sm">
                                                <div className="col-span-2 text-center font-medium text-foreground">{insp.type}</div>
                                                <div className="col-span-2 text-center">
                                                    <Badge variant={insp.status === '완료' ? 'default' : 'secondary'} className="font-normal">
                                                        {insp.status}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3 text-center text-foreground/80 font-mono">
                                                    {format(new Date(insp.scheduledDate), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                                </div>
                                                <div className="col-span-2 text-center text-muted-foreground font-mono">
                                                    {format(new Date(insp.createdAt), 'MM.dd', { locale: ko })}
                                                </div>
                                                <div className="col-span-3 text-center text-muted-foreground truncate">
                                                    {insp.result || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                                            <ClipboardCheck className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-foreground">검사 내역이 없습니다</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                아직 진행된 오염 검사가 없습니다.<br />
                                                우측 상단의 버튼을 눌러 새로운 검사를 신청해주세요.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals remain mostly same but styles refined */}
            <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEquipment?.category === '대여' ? <Key className="w-5 h-5 text-primary" /> : <Package className="w-5 h-5 text-primary" />}
                            {selectedEquipment?.name}
                        </DialogTitle>
                        <DialogDescription>{selectedEquipment?.description}</DialogDescription>
                    </DialogHeader>
                    {/* ... Modal content ... reused logic ... */}
                    <div className="py-4 space-y-4">

                        {selectedEquipment?.requiresApproval && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded text-sm text-destructive">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>이 장비는 결재 승인이 필요합니다.</span>
                            </div>
                        )}
                        {selectedEquipment?.category === '대여' && (
                            <div className="space-y-2">
                                <Label>대여 기간 <span className="text-destructive">*</span></Label>
                                <div className="flex gap-2">
                                    {[1, 3, 7, 14, 30].map(day => (
                                        <Button key={day} variant={rentalDays === day.toString() ? "default" : "outline"} className="flex-1 h-9 text-xs" onClick={() => setRentalDays(day.toString())}>{day}일</Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedEquipment?.category === '지급' && (
                            <div className="space-y-2">
                                <Label>수량 <span className="text-destructive">*</span></Label>
                                <Input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>신청 사유 <span className="text-destructive">*</span></Label>
                            <Textarea placeholder="사용 목적을 입력하세요." value={equipmentReason} onChange={(e) => setEquipmentReason(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setSelectedEquipment(null)}>취소</Button>
                        <Button className="flex-1 sm:flex-none" onClick={handleEquipmentRequest}>{selectedEquipment?.requiresApproval ? '결재 요청' : '신청하기'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
                <DialogContent>
                    {/* ... Facilities Modal ... reuse existing layout */}
                    <DialogHeader>
                        <DialogTitle>{selectedLocation?.name} 방문 예약</DialogTitle>
                    </DialogHeader>
                    {/* ... Body ... */}
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>방문 날짜</Label>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full text-left font-normal">{visitDate ? format(visitDate, 'yyyy-MM-dd') : '날짜 선택'}</Button></PopoverTrigger>
                                <PopoverContent className="p-0"><Calendar mode="single" selected={visitDate} onSelect={setVisitDate} disabled={isDateDisabled} locale={ko} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>시간</Label>
                            <Select value={visitTime} onValueChange={setVisitTime}>
                                <SelectTrigger><SelectValue placeholder="시간 선택" /></SelectTrigger>
                                <SelectContent>
                                    {getAvailableSlots().map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                                    {getAvailableSlots().length === 0 && <div className="p-2 text-sm text-center">예약 가능 시간 없음</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>목적</Label>
                            <Textarea value={visitReason} onChange={e => setVisitReason(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setSelectedLocation(null)}>취소</Button>
                        <Button className="flex-1 sm:flex-none" onClick={handleVisitSubmit}>{selectedLocation?.requiresApproval ? '결재 요청' : '예약하기'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

export default ResourcesPage;
