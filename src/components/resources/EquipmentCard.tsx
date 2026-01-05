import { Equipment } from '@/types/haetae';
import { useResource } from '@/contexts/ResourceContext';
import { Badge } from '@/components/ui/badge';

interface EquipmentCardProps {
    item: Equipment;
    onSelect: (item: Equipment) => void;
}

export function EquipmentCard({ item, onSelect }: EquipmentCardProps) {
    const { rentals } = useResource();

    return (
        <div
            onClick={() => onSelect(item)}
            className="group bg-white border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full flex flex-col"
        >
            {/* Card Content Wrapper */}
            <div className="flex-1 flex flex-col p-5 h-full items-start text-left">
                <div className="flex w-full justify-between items-start gap-2 mb-3">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {item.name}
                    </h3>
                    {item.category === '대여' && item.type && (
                        <Badge variant="secondary" className="shrink-0 bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 rounded text-[10px] px-2 h-5 font-normal">
                            {item.type}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                </p>
            </div >
        </div >
    );
}
