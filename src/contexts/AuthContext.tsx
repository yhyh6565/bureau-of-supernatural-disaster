import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Agent, Department } from '@/types/haetae';

// 더미 요원 데이터
const MOCK_AGENTS: Record<string, Agent> = {
  '김솔음': {
    id: 'agent-001',
    name: '김솔음',
    department: 'baekho',
    rank: '주무관',
    extension: '3301',
    status: '정상',
  },
  '박현무': {
    id: 'agent-002',
    name: '박현무',
    department: 'hyunmu',
    rank: '팀장',
    extension: '2201',
    status: '정상',
  },
  '이주작': {
    id: 'agent-003',
    name: '이주작',
    department: 'jujak',
    rank: '실무관',
    extension: '4401',
    status: '정상',
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

  const login = (personaKey: string): boolean => {
    // 페르소나 로직: 한글 이름 석 자로 로그인
    const foundAgent = MOCK_AGENTS[personaKey];
    if (foundAgent) {
      setAgent(foundAgent);
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
