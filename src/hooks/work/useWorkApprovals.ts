import { useMemo, useEffect } from 'react';
import { ApprovalDocument, Agent } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { usePersistentState } from '@/hooks/usePersistentState';
import * as approvalService from '@/services/approvalService';
import segwangApprovals from '@/data/segwang/approvals.json';

const STORAGE_KEYS = {
    APPROVALS: 'haetae_session_approvals',
};

const parseApprovals = (data: any[]): ApprovalDocument[] => {
    return data.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        processedAt: item.processedAt ? new Date(item.processedAt) : undefined
    }));
};

export function useWorkApprovals(
    agent: Agent | null,
    mode: 'normal' | 'segwang'
) {
    const [sessionApprovals, setSessionApprovals] = usePersistentState<ApprovalDocument[]>(
        STORAGE_KEYS.APPROVALS,
        [],
        parseApprovals
    );

    useEffect(() => {
        if (!agent) {
            setSessionApprovals([]);
        }
    }, [agent, setSessionApprovals]);

    const approvals = useMemo(() => {
        if (!agent) return [];

        const base = mode === 'segwang'
            ? (segwangApprovals as any[]).map(doc => ({
                ...doc,
                createdByName: 'Unknown',
                approverName: 'Unknown',
                createdBy: 'unknown-id',
                approver: 'admin-id',
                createdAt: new Date(doc.createdAt)
            })) as ApprovalDocument[]
            : DataManager.getApprovals(agent);

        return [...sessionApprovals, ...base];
    }, [agent, sessionApprovals, mode]);

    const addApproval = (data: Omit<ApprovalDocument, 'id' | 'createdAt' | 'processedAt' | 'approverName'>) => {
        if (!agent) return;
        const newDoc = approvalService.createApprovalDocument(data, agent);
        setSessionApprovals((prev: ApprovalDocument[]) => [newDoc, ...prev]);
    };

    return {
        approvals,
        addApproval
    };
}
