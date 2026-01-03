import { Equipment } from '@/types/haetae';
import { useResource } from '@/contexts/ResourceContext';
import { Badge } from '@/components/ui/badge';
import { Key, ShoppingCart } from 'lucide-react';

interface EquipmentCardProps {
    item: Equipment;
    onSelect: (item: Equipment) => void;
}

export function EquipmentCard({ item, onSelect }: EquipmentCardProps) {
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
