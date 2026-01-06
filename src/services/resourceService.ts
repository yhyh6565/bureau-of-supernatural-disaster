import { RentalRecord, Equipment, Agent } from '@/types/haetae';

// 대여/지급 기록 생성
export const createRentalRecord = (
    equipment: Equipment,
    rentalDays: number = 1,
    quantity: number = 1
): RentalRecord => {
    const rentalDate = new Date();
    let dueDate: Date | undefined;

    if (equipment.category === '대여') {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + rentalDays);
    }

    return {
        id: `rent-${Date.now()}`,
        equipmentName: equipment.name,
        category: equipment.category,
        rentalDate: rentalDate,
        dueDate: dueDate,
        status: '정상',
        quantity: quantity
    };
};

// 재고 계산 로직
export const calculateAvailableStock = (
    item: Equipment,
    userRentals: RentalRecord[]
): number => {
    const myRentalCount = userRentals
        .filter(r =>
            r.equipmentName === item.name &&
            (r.status === '정상' || r.status === '연체')
        )
        .reduce((sum, r) => sum + (r.quantity || 1), 0);

    return Math.max(0, (item.totalStock ?? 100) - myRentalCount);
};
