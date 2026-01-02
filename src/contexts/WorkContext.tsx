import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Schedule, ApprovalDocument, VisitLocation } from '@/types/haetae';
import { useAuth } from '@/contexts/AuthContext';
import { DataManager } from '@/data/dataManager';
import * as approvalService from '@/services/approvalService';
import * as scheduleService from '@/services/scheduleService';

interface WorkContextType {
    schedules: Schedule[];
    approvals: ApprovalDocument[];
    addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
    addVisitSchedule: (location: VisitLocation, date: Date) => void;
    addApproval: (doc: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>) => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export function WorkProvider({ children }: { children: ReactNode }) {
    const { agent } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [approvals, setApprovals] = useState<ApprovalDocument[]>([]);

    useEffect(() => {
        if (agent) {
            setSchedules(DataManager.getSchedules(agent));
            setApprovals(DataManager.getApprovals(agent));
        } else {
            setSchedules([]);
            setApprovals([]);
        }
    }, [agent?.id]);

    const addSchedule = (data: Omit<Schedule, 'id'>) => {
        const newSchedule = scheduleService.createSchedule(data);
        setSchedules(prev => [...prev, newSchedule]);
    };

    const addVisitSchedule = (location: VisitLocation, date: Date) => {
        const newSchedule = scheduleService.createVisitSchedule(location, date);
        setSchedules(prev => [...prev, newSchedule]);
    };

    const addApproval = (data: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>) => {
        if (!agent) return;
        const newDoc = approvalService.createApprovalDocument(data, agent);
        setApprovals(prev => [newDoc, ...prev]);
    };

    return (
        <WorkContext.Provider value={{
            schedules,
            approvals,
            addSchedule,
            addVisitSchedule,
            addApproval
        }}>
            {children}
        </WorkContext.Provider>
    );
}

export function useWork() {
    const context = useContext(WorkContext);
    if (context === undefined) {
        throw new Error('useWork must be used within a WorkProvider');
    }
    return context;
}
