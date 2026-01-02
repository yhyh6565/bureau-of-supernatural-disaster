import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Agent, Department } from '@/types/haetae';

// 세션 스토리지 키
const SESSION_STORAGE_KEY = 'haetae_agent_session';

// 더미 요원 데이터 (기존 데이터 유지)
// 생략: MOCK_AGENTS 데이터는 너무 길어서 파일 크기 문제로 전체를 다시 쓰기보다는
// replace_file_content를 사용할까 했지만, 구조가 많이 바뀌어 write_to_file이 안전함.
// MOCK_AGENTS는 Step 731의 내용과 동일하게 사용.
// 하지만 컨텍스트 윈도우 절약을 위해 MOCK_AGENTS 만 별도 파일 분리하는 것도 방법이나,
// 지금은 전체 파일 작성을 요청 받았으므로 MOCK_AGENTS 포함하여 작성.
// (아래 MOCK_AGENTS 내용은 Step 731에서 복사)

const MOCK_AGENTS: Record<string, Agent> = {
  '박홍림': {
    id: 'HMU-001',
    name: '박홍림',
    personaKey: 'parkhonglim',
    codename: '홍화',
    department: 'hyunmu',
    team: '1팀',
    rank: '팀장',
    extension: '2101',
    status: '정상',
    contamination: 5,
    totalIncidents: 52,
    specialCases: 15,
    rentals: [],
    purificationHistory: [new Date('2025-12-15')],
    funeralPreference: '매장',
    grade: 6
  },
  '최요원': {
    id: 'HMU-002',
    name: '최요원',
    personaKey: 'choiyowon',
    codename: '미상',
    department: 'hyunmu',
    team: '1팀',
    rank: '실무관',
    extension: '2102',
    status: '정상',
    contamination: 35,
    totalIncidents: 28,
    specialCases: 8,
    rentals: [
      {
        id: 'rent-001',
        equipmentName: 'EMF 탐지기 (Pro)',
        category: '대여',
        rentalDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-15'),
        status: '연체',
        quantity: 1
      },
      {
        id: 'rent-002',
        equipmentName: '기본 보급품 세트',
        category: '지급',
        rentalDate: new Date('2025-11-20'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-003',
        equipmentName: '행방 막대',
        category: '대여',
        rentalDate: new Date('2025-12-28'),
        dueDate: new Date('2026-01-04'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-004',
        equipmentName: '햇살잡이',
        category: '대여',
        rentalDate: new Date('2025-12-25'),
        dueDate: new Date('2026-01-08'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-005',
        equipmentName: '유리손포',
        category: '지급',
        rentalDate: new Date('2025-01-01'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-006',
        equipmentName: '작두(의식용)',
        category: '대여',
        rentalDate: new Date('2025-12-30'),
        dueDate: new Date('2026-01-06'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-007',
        equipmentName: '도깨비 감투',
        category: '대여',
        rentalDate: new Date('2025-12-31'),
        dueDate: new Date('2026-01-07'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-008',
        equipmentName: '간이 유리 감옥',
        category: '대여',
        rentalDate: new Date('2025-12-20'),
        dueDate: new Date('2026-01-10'),
        status: '정상',
        quantity: 1
      },
      {
        id: 'rent-cyw-009',
        equipmentName: '신발끈',
        category: '대여',
        rentalDate: new Date('2025-11-01'),
        dueDate: new Date('2026-02-01'),
        status: '정상'
      }
    ],
    purificationHistory: [new Date('2025-12-20'), new Date('2025-12-10')],
    funeralPreference: '화장',
    grade: 7
  },
  '류재관': {
    id: 'HMU-003',
    name: '류재관',
    personaKey: 'ryujaegwan',
    codename: '청동',
    department: 'hyunmu',
    team: '1팀',
    rank: '실무관',
    extension: '2103',
    status: '정상',
    contamination: 18,
    totalIncidents: 35,
    specialCases: 10,
    rentals: [],
    purificationHistory: [new Date('2025-12-05')],
    funeralPreference: '매장',
    grade: 8
  },
  '김솔음': {
    id: 'HMU-004',
    name: '김솔음',
    personaKey: 'solum',
    codename: '포도',
    department: 'hyunmu',
    team: '1팀',
    rank: '실무관',
    extension: '2104',
    status: '정상',
    contamination: 22,
    totalIncidents: 24,
    specialCases: 7,
    rentals: [],
    purificationHistory: [new Date('2025-11-28')],
    funeralPreference: '수목장',
    grade: 7
  },
  '해금': {
    id: 'HMU-301',
    name: '해금',
    personaKey: 'haegeum',
    codename: '해금',
    department: 'hyunmu',
    team: '3팀',
    rank: '팀장',
    extension: '2301',
    status: '정상',
    contamination: 12,
    totalIncidents: 48,
    specialCases: 18,
    rentals: [],
    purificationHistory: [new Date('2025-12-01')],
    funeralPreference: '데이터 소각',
    grade: 6
  },
  '고영은': {
    id: 'BKH-201',
    name: '고영은',
    personaKey: 'koyoungeun',
    codename: '박하',
    department: 'baekho',
    team: '2팀',
    rank: '실무관',
    extension: '3201',
    status: '정상',
    contamination: 15,
    totalIncidents: 31,
    specialCases: 6,
    rentals: [
      {
        id: 'rent-003',
        equipmentName: '야간 투시경',
        category: '대여',
        rentalDate: new Date('2025-12-28'),
        dueDate: new Date('2026-01-04'),
        status: '정상',
        quantity: 1
      }
    ],
    purificationHistory: [new Date('2025-11-20')],
    funeralPreference: '화장',
    grade: 7
  },
  '장허운': {
    id: 'JJK-201',
    name: '장허운',
    personaKey: 'janghyeowoon',
    codename: '화각',
    department: 'jujak',
    team: '2팀',
    rank: '실무관',
    extension: '4201',
    status: '정상',
    contamination: 28,
    totalIncidents: 26,
    specialCases: 4,
    rentals: [],
    purificationHistory: [new Date('2025-12-18'), new Date('2025-11-25')],
    funeralPreference: '기억 소거 후 방생',
    grade: 7
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

  const login = (personaKey: string): boolean => {
    // 1. 네임드 요원 확인
    const foundAgent = MOCK_AGENTS[personaKey.trim()];
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
