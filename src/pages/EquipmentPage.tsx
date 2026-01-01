import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Equipment } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { Package, Key, ShoppingCart, AlertCircle, CheckCircle, Home, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EquipmentPage() {
  const allEquipment = DataManager.getEquipment();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [rentalDays, setRentalDays] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const rentalEquipment = allEquipment.filter(e => e.category === '대여');
  const supplyEquipment = allEquipment.filter(e => e.category === '지급');

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: '입력 오류',
        description: '사유를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedEquipment?.requiresApproval) {
      toast({
        title: '결재 요청 완료',
        description: `"${selectedEquipment.name}" 대여 건이 결재 상신되었습니다.`,
      });
    } else {
      toast({
        title: '신청 완료',
        description: `"${selectedEquipment?.name}" ${selectedEquipment?.category === '대여' ? '대여' : '지급'} 신청이 완료되었습니다.`,
      });
    }
    setSelectedEquipment(null);
    setReason('');
  };

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <div
      className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => setSelectedEquipment(item)}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
          {item.category === '대여' ? <Key className="w-6 h-6 text-muted-foreground" /> : <ShoppingCart className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{item.name}</span>
            {item.requiresApproval && (
              <Badge variant="outline" className="text-xs">승인필요</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">재고:</span>
            <span className={`text-sm font-mono ${item.availableStock < 5 ? 'text-warning' : 'text-success'}`}>
              {item.availableStock} / {item.totalStock}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold">장비/서비스</h1>
        <p className="text-sm text-muted-foreground">장비 대여 및 소모품 지급을 신청합니다.</p>
      </div>

      <Tabs defaultValue="rental" className="pb-12">
        <TabsList className="mb-4">
          <TabsTrigger value="rental" className="gap-2">
            <Key className="w-4 h-4" />
            장비 대여
          </TabsTrigger>
          <TabsTrigger value="supply" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            장비 지급
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            <Package className="w-4 h-4" />
            서비스 신청
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rental">
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4" />
                대여 가능 장비
                <Badge variant="secondary" className="ml-auto">{rentalEquipment.length}종</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rentalEquipment.map((item) => (
                  <EquipmentCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supply">
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                지급 가능 물품 (소모품)
                <Badge variant="secondary" className="ml-auto">{supplyEquipment.length}종</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supplyEquipment.map((item) => (
                  <EquipmentCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card className="card-gov">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                서비스 신청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                      <Home className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">기숙사 입주 신청</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        관사 기숙사 입주를 신청합니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-sm hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                      <Calendar className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">기숙사 연장 신청</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        기숙사 입주 기간을 연장합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 장비 신청 모달 */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                {selectedEquipment?.category === '대여' ? <Key className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </span>
              {selectedEquipment?.name} {selectedEquipment?.category === '대여' ? '대여' : '지급'} 신청
            </DialogTitle>
            <DialogDescription>{selectedEquipment?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedEquipment?.requiresApproval && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>이 장비는 결재 승인 후 대여 가능합니다.</span>
              </div>
            )}

            {selectedEquipment?.category === '대여' && (
              <div className="space-y-2">
                <Label>대여 기간 <span className="text-destructive">*</span></Label>
                <Select value={rentalDays} onValueChange={setRentalDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1일</SelectItem>
                    <SelectItem value="3">3일</SelectItem>
                    <SelectItem value="7">7일</SelectItem>
                    <SelectItem value="14">14일</SelectItem>
                    <SelectItem value="30">30일</SelectItem>
                  </SelectContent>
                </Select>
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
              <Label>사유 <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="신청 사유를 입력하세요..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">현재 재고</span>
              <span className="font-mono">
                {selectedEquipment?.availableStock} / {selectedEquipment?.totalStock}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEquipment(null)}>취소</Button>
            <Button onClick={handleSubmit}>
              {selectedEquipment?.requiresApproval ? '결재 요청' : '신청'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default EquipmentPage;
