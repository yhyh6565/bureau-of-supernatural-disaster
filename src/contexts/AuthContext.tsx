import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Agent, Department } from '@/types/haetae';

// Import Profile JSONs
import PARKHONGLIM_PROFILE from '@/data/personas/parkhonglim/profile.json';
import CHOIYOWON_PROFILE from '@/data/personas/choiyowon/profile.json';
import RYUJAEGWAN_PROFILE from '@/data/personas/ryujaegwan/profile.json';
import SOLUM_PROFILE from '@/data/personas/solum/profile.json';
import HAEGEUM_PROFILE from '@/data/personas/haegeum/profile.json';
import KOYOUNGEUN_PROFILE from '@/data/personas/koyoungeun/profile.json';
import JANGHYEOWOON_PROFILE from '@/data/personas/janghyeowoon/profile.json';

// 세션 스토리지 키
const SESSION_STORAGE_KEY = 'haetae_agent_session';

// Helper to revive dates in Agent profile
const parseAgentProfile = (profile: any): Agent => {
  const agent = { ...profile };
  
  // Date fields conversion
  if (agent.purificationHistory) {
     agent.purificationHistory = agent.purificationHistory.map((d: string) => new Date(d));
  }
  
  if (agent.rentals) {
    agent.rentals = agent.rentals.map((r: any) => ({
      ...r,
      rentalDate: r.rentalDate ? new Date(r.rentalDate) : undefined,
      dueDate: r.dueDate ? new Date(r.dueDate) : undefined,
    }));
  }
  
  return agent as Agent;
};

// Load and parse profiles
const AGENT_PROFILES: Record<string, Agent> = {
  'parkhonglim': parseAgentProfile(PARKHONGLIM_PROFILE),
  'choiyowon': parseAgentProfile(CHOIYOWON_PROFILE),
  'ryujaegwan': parseAgentProfile(RYUJAEGWAN_PROFILE),
  'solum': parseAgentProfile(SOLUM_PROFILE),
  'haegeum': parseAgentProfile(HAEGEUM_PROFILE),
  'koyoungeun': parseAgentProfile(KOYOUNGEUN_PROFILE),
  'janghyeowoon': parseAgentProfile(JANGHYEOWOON_PROFILE),
};

// Map by name for easy lookup (e.g. login by name) if needed, though login uses personaKey usually.
// Login logic below uses personaKey directly against AGENT_PROFILES keys, 
// OR agent name. Let's support both for robustness.
const AGENT_NAME_MAP: Record<string, Agent> = Object.values(AGENT_PROFILES).reduce((acc, agent) => {
  acc[agent.name] = agent;
  return acc;
}, {} as Record<string, Agent>);

interface AuthContextType {
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (personaKey: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(() => {
    // 초기 상태: sessionStorage에서 복원 시도
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Date 필드 복원
        if (parsed.purificationHistory) {
          parsed.purificationHistory = parsed.purificationHistory.map((d: string) => new Date(d));
        }
        if (parsed.rentals) {
          parsed.rentals = parsed.rentals.map((r: any) => ({
            ...r,
            rentalDate: r.rentalDate ? new Date(r.rentalDate) : undefined,
            dueDate: r.dueDate ? new Date(r.dueDate) : undefined,
          }));
        }
        return parsed as Agent;
      } catch {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    return null;
  });

  // agent 상태가 변경되면 sessionStorage에 저장
  useEffect(() => {
    if (agent) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(agent));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [agent]);

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
      team: `${randomTeamNum}팀`,
      rank: fixedRank,
      grade: fixedGrade,
      extension: `${Math.floor(Math.random() * 8999) + 1000}`,
      status: '정상',
      contamination: Math.floor(Math.random() * 40), // 0~40 랜덤 오염도
      totalIncidents: Math.floor(Math.random() * 50),
      specialCases: Math.floor(Math.random() * 5),
      rentals: [],
      purificationHistory: [],
    };
  };

  const login = (personaKeyInput: string): boolean => {
    const key = personaKeyInput.trim();
    
    // 1. 네임드 요원 확인 (키로 검색)
    let foundAgent = AGENT_PROFILES[key];
    
    // 2. 이름으로도 검색 지원 (사용자 편의)
    if (!foundAgent) {
       foundAgent = AGENT_NAME_MAP[key];
    }

    if (foundAgent) {
      setAgent(foundAgent);
      return true;
    }

    // 3. 평범한 요원 (동적 생성)
    // 입력값이 있으면 무조건 로그인 성공으로 처리 (단, 빈 값은 제외)
    if (key.length > 0) {
      const newAgent = createRandomAgent(key);
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
