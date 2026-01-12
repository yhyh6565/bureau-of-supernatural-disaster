import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RentalRecord, Equipment } from '@/types/haetae';
import { useAuthStore } from '@/store/authStore';
import * as resourceService from '@/services/resourceService';
import { usePersistentState } from '@/hooks/usePersistentState';

interface ResourceContextType {
    rentals: RentalRecord[];
    addRental: (item: Equipment, days?: number, quantity?: number) => void;
    // 추후 반납 기능 등 확장 가능
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

// Session Storage Key
const STORAGE_KEYS = {
    RENTALS: 'haetae_session_rentals',
};

// Deserializer
const parseRentals = (data: any[]): RentalRecord[] => {
    return data.map(item => ({
        ...item,
        rentalDate: new Date(item.rentalDate),
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined
    }));
};

export function ResourceProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuthStore();

    // Persistent Session State
    const [rentals, setRentals] = usePersistentState<RentalRecord[]>(
        STORAGE_KEYS.RENTALS,
        [],
        parseRentals
    );

    // 초기화: 로그인 시 agent의 rentals 로드
    useEffect(() => {
        if (agent) {
            // 이미 세션에 데이터가 있다면(새로고침 등) 초기화하지 않음 (선택 사항)
            // 하지만 요구사항은 '로그인 세션 내'이므로, 로그아웃 후 재로그인시에는 초기화되어야 함.
            // usePersistentState는 sessionStorage를 쓰므로 탭 닫으면 날아감.
            // 여기서는 "기본 지급 아이템" 로직을 유지하면서, 기존 세션 데이터가 없으면 초기화하는 방식으로 보강 가능.

            // 단순화: 세션 데이터가 비어있을 때만 기본 지급 로직 + 초기 데이터 로드 수행
            if (rentals.length === 0) {
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
            }
        } else {
            setRentals([]);
        }
    }, [agent?.id]); // ID가 바뀔 때만 확인

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
