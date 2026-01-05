import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RentalRecord, Equipment } from '@/types/haetae';
import { useAuth } from '@/contexts/AuthContext';
import * as resourceService from '@/services/resourceService';

interface ResourceContextType {
    rentals: RentalRecord[];
    addRental: (item: Equipment, days?: number, quantity?: number) => void;
    // 추후 반납 기능 등 확장 가능
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function ResourceProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuth();
    const [rentals, setRentals] = useState<RentalRecord[]>([]);

    // 초기화: 로그인 시 agent의 rentals 로드
    useEffect(() => {
        if (agent) {
            // agent.rentals는 초기 스냅샷일 수 있으므로, 이미 로드된 상태가 아니면 로드
            // 여기서는 단순하게 agent가 바뀔 때(로그인) 리셋
            let baseRentals = agent.rentals || [];

            // 현무팀(hyunmu) 소속 요원에게 '신발끈' 기본 지급
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

            setRentals(baseRentals);
        } else {
            setRentals([]);
        }
    }, [agent?.id]); // ID가 바뀔 때만 (즉 로그인 시)

    const addRental = (item: Equipment, days: number = 1, quantity: number = 1) => {
        if (!agent) return;
        const newRental = resourceService.createRentalRecord(item, days, quantity);
        setRentals(prev => [...prev, newRental]);
    };

    return (
        <ResourceContext.Provider value={{ rentals, addRental }}>
            {children}
        </ResourceContext.Provider>
    );
}

export function useResource() {
    const context = useContext(ResourceContext);
    if (context === undefined) {
        throw new Error('useResource must be used within a ResourceProvider');
    }
    return context;
}
