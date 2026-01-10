import { create } from 'zustand';
import { RentalRecord, Equipment, Agent } from '@/types/haetae';
import * as resourceService from '@/services/resourceService';

interface ResourceState {
    rentals: RentalRecord[];
    // Actions
    initializeRentals: (agent: Agent) => void;
    addRental: (item: Equipment, days?: number, quantity?: number) => void;
    clearRentals: () => void;
}

export const useResourceStore = create<ResourceState>()((set, get) => ({
    rentals: [],

    initializeRentals: (agent: Agent) => {
        let baseRentals = agent.rentals || [];

        // 현무팀(hyunmu) 소속 요원에게 '신발끈' 기본 지급 로직
        // Moved from useEffect (Context) to explicit initialization action
        if (agent.department === 'hyunmu') {
            const hasShoelace = baseRentals.some(r => r.equipmentName === '오방색 신발끈');
            if (!hasShoelace) {
                const shoelaceEquipment: RentalRecord = {
                    id: `rental-shoelace-${agent.id}`,
                    equipmentName: '오방색 신발끈',
                    category: '지급',
                    rentalDate: new Date(),
                    status: '정상',
                    quantity: 1,
                };
                baseRentals = [...baseRentals, shoelaceEquipment];
            }
        }

        set({ rentals: baseRentals });
    },

    addRental: (item: Equipment, days: number = 1, quantity: number = 1) => {
        const newRental = resourceService.createRentalRecord(item, days, quantity);
        set(state => ({ rentals: [...state.rentals, newRental] }));
    },

    clearRentals: () => {
        set({ rentals: [] });
    }
}));
