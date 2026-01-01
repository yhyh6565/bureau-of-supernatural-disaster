import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Agent, Department } from '@/types/haetae';

// 더미 요원 데이터
const MOCK_AGENTS: Record<string, Agent> = {
  '김솔음': {
    id: 'agent-001',
    name: '김솔음',
    codename: '호박',
    department: 'baekho',
    rank: '주무관',
    extension: '3301',
    status: '정상',
    contamination: 15,
    totalIncidents: 17,
    specialCases: 3,
    equipmentInUse: [],
    purificationHistory: [new Date('2025-11-20'), new Date('2025-10-15')],
    funeralPreference: '화장',
    grade: 7
  },
  '박현무': {
    id: 'agent-002',
    name: '박현무',
    codename: '청동',
    department: 'hyunmu',
    rank: '팀장',
    extension: '2201',
    status: '정상',
    contamination: 8,
    totalIncidents: 45,
    specialCases: 12,
    equipmentInUse: ['eq-001'],
    purificationHistory: [new Date('2025-12-01')],
    funeralPreference: '매장',
    grade: 6
  },
  '이주작': {
    id: 'agent-003',
    name: '이주작',
    codename: '주홍',
    department: 'jujak',
    rank: '실무관',
    extension: '4401',
    status: '정상',
    contamination: 22,
    totalIncidents: 28,
    specialCases: 5,
    equipmentInUse: [],
    purificationHistory: [new Date('2025-11-28'), new Date('2025-10-30')],
    funeralPreference: '수목장',
    grade: 8
  },
};

interface AuthContextType {
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (personaKey: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);

  // 랜덤 요원 생성 유틸리티
  const createRandomAgent = (name: string): Agent => {
    const departments: Department[] = ['baekho', 'hyunmu', 'jujak'];
    const randomDept = departments[Math.floor(Math.random() * departments.length)];
    const randomTeamNum = Math.floor(Math.random() * 3) + 1; // 1~3팀

    // 평범한 요원은 9급 실무관 고정
    const fixedRank = '실무관';
    const fixedGrade = 9;

    // 코드명 생성 부서코드-숫자
    const deptCode = randomDept === 'baekho' ? 'BKH' : randomDept === 'hyunmu' ? 'HMU' : 'JJK';
    const randomCodeNum = Math.floor(Math.random() * 99) + 10;

    return {
      id: `agent-${Math.random().toString(36).substr(2, 5)}`,
      name: name,
      codename: `${deptCode}-${randomCodeNum}`,
      department: randomDept,
      rank: fixedRank,
      grade: fixedGrade,
      extension: `${Math.floor(Math.random() * 8999) + 1000}`,
      status: '정상',
      contamination: Math.floor(Math.random() * 40), // 0~40 랜덤 오염도
      totalIncidents: Math.floor(Math.random() * 50),
      specialCases: Math.floor(Math.random() * 5),
      equipmentInUse: [],
      purificationHistory: [],
    };
  };

  const login = (personaKey: string): boolean => {
    // 1. 네임드 요원 확인
    const foundAgent = MOCK_AGENTS[personaKey];
    if (foundAgent) {
      setAgent(foundAgent);
      return true;
    }

    // 2. 평범한 요원 (동적 생성)
    // 입력값이 있으면 무조건 로그인 성공으로 처리 (단, 빈 값은 제외)
    if (personaKey.trim().length > 0) {
      const newAgent = createRandomAgent(personaKey);
      setAgent(newAgent);
      return true;
    }

    return false;
  };

  const logout = () => {
    setAgent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        agent,
        isAuthenticated: agent !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
