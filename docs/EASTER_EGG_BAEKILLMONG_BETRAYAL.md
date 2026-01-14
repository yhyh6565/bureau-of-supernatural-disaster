# 이스터에그: 백일몽 주식회사 배신자 처벌

## 📋 개요

백일몽 주식회사 직원들에게 쪽지를 보내려고 시도하는 플레이어를 도깨비가 처벌하는 이스터에그입니다.

- **트리거 방식**: 쪽지 발송 시 특정 이름 입력
- **단계**: 2단계 (1회 경고 → 2회 처벌)
- **테마**: 도깨비의 분노, 배신자 처벌
- **영향 범위**: 쪽지 시스템, 전체 화면 UI, 세션 관리

---

## 🎯 트리거 조건

### 대상 이름 목록 (19명)

쪽지 발송 시 **받는 사람** 필드에 다음 이름 중 하나를 입력하고 **발송** 버튼을 클릭하면 트리거됩니다:

```
백석주, 진나솔, 이성해, 이자헌, 은하제, 박민성, 백사헌, 강이학,
이석종, 강도준, 윤조훈, 이재진, 이승조, 곽제강, 최명진, 박경환,
이병진, 김허운, 이허운
```

### 트리거 조건 체크

- 받는 사람 필드가 **정확히** 위 이름 중 하나와 일치해야 함
- 공백, 대소문자 구분 없이 매칭 (예: "백석주", " 백석주 " 모두 매칭)
- 제목이나 내용은 상관없음

---

## 📬 1회 트리거: 경고 단계

### 시퀀스 플로우

```
사용자가 발송 버튼 클릭
    ↓
쪽지 정상 발송
    ↓
보낸 쪽지함에 쪽지 추가 (수신자 마스킹)
    ↓
5초 대기
    ↓
도깨비 경고 쪽지 자동 도착
    ↓
우하단 토스트 알림 표시
```

### 1단계: 쪽지 발송 처리

**동작:**
- 쪽지가 정상적으로 발송됨
- **보낸 쪽지함**에 해당 쪽지가 표시됨
- 수신자 이름을 마스킹 처리

**보낸 쪽지 데이터 구조:**
```typescript
{
  id: `msg-sent-${Date.now()}`,
  senderId: agent.id,
  senderName: agent.name,
  senderDepartment: agent.department,
  receiverId: '■■■(알 수 없음)',  // 마스킹
  title: [사용자가 입력한 제목],
  content: [사용자가 입력한 내용],
  createdAt: new Date(),
  isRead: true
}
```

### 2단계: 도깨비 경고 쪽지 (5초 후)

**타이밍:** 발송 완료 후 정확히 5초 후

**토스트 알림:**
```typescript
toast({
  title: "새로운 쪽지",
  description: "魑魅님으로부터 쪽지가 도착했습니다",
  variant: "default",  // 평범한 스타일
})
```

**경고 쪽지 데이터 구조:**
```typescript
{
  id: `msg-dokkaebi-warning-${Date.now()}`,
  senderId: 'dokkaebi',
  senderName: '魑魅',
  senderDepartment: '',  // 빈 문자열 또는 undefined
  receiverId: agent.id,
  title: '경고',
  content: `어허, 저기 낯짝 두꺼운 것들 좀 보게! 나랏일 한다고 으스대더니 속은 시커먼 숯검정이로구나. 배신질로 배를 채우려거든 저기 들개들이나 찾아갈 것이지, 어디라고 감히 또 발을 들이밀어!

내 오늘 우리 김서방의 너그러운 낯을 봐서, 딱 이번 한 번만! 정말이지 이번 딱 한 번만 눈 감아주마. 허나 명심하거라. 이 도깨비 방망이는 두 번 참는 법이 없느니라!

또다시 신의를 저버리고 뒤통수를 칠 생각일랑 아예 접는 게 좋을 게야. 그때는 내 이 방망이가 네놈들 정수리를 가만두지 않을 것이니, 국물도 없을 줄 알아라! 알았으면 그 비겁한 낯짝 치우고 어서 썩 물러가거라! 에잇, 퉤! 재수 없으니 소금이라도 뿌려야겠구먼!`,
  createdAt: new Date(),
  displayDate: new Date().toLocaleDateString('ko-KR'),
  isRead: false
}
```

**위치:** 받은 쪽지함에 표시

### 3단계: 쪽지 읽음 처리

**동작:**
- 사용자가 경고 쪽지를 클릭하여 열람하면
- 쪽지가 자동으로 삭제됨
- 받은 쪽지함에서 사라짐

**구현 방법:**
```typescript
// 쪽지 열람 시
const handleReadWarningMessage = (messageId: string) => {
  if (messageId.startsWith('msg-dokkaebi-warning-')) {
    // 읽음 처리
    markAsRead(messageId);

    // 즉시 삭제
    removeSessionMessage(messageId);
  }
}
```

---

## ⚡ 2회 트리거: 처벌 단계

### 시퀀스 플로우

```
사용자가 두 번째로 발송 버튼 클릭
    ↓
모든 UI 요소가 황색으로 변화 (3초)
    ↓
화면 전체가 검은색으로 전환
    ↓
도깨비 저주 텍스트 표시 (3초)
    ↓
강제 로그아웃 + 로그인 화면으로 리다이렉트
```

### 1단계: 황색 UI 변화 (3초)

**동작:**
- 발송 버튼 클릭 즉시 실행
- 화면의 모든 UI 요소가 황색(yellow) 계열로 변경
- 3초간 유지

**구현 방법:**
```typescript
// 전체 화면에 황색 필터 오버레이
<div className="fixed inset-0 bg-yellow-500/30 z-[9998] animate-pulse" />

// 또는 CSS 필터 사용
document.body.style.filter = 'sepia(1) hue-rotate(30deg) saturate(4)';
```

**CSS 클래스 예시:**
```css
.yellow-ui-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(234, 179, 8, 0.3); /* yellow-500 with 30% opacity */
  z-index: 9998;
  animation: pulse 1s ease-in-out infinite;
  pointer-events: none;
}
```

### 2단계: 검은 화면 전환

**동작:**
- 황색 효과 3초 후
- 화면이 순식간에 검은색으로 전환
- 모든 UI가 보이지 않음

**구현 방법:**
```typescript
<div className="fixed inset-0 bg-black z-[9999]" />
```

### 3단계: 도깨비 저주 텍스트 표시 (3초)

**동작:**
- 검은 화면 위에 텍스트가 화면을 가득 채움
- 스크롤 없이 화면에 꽉 차도록 표시
- 3초간 유지

**텍스트 내용:**
```
누구냐! 거기서 뒤를 돌아보는 놈이 누구냐! 은혜를 원수로 갚은 놈들은 저승길도 아까워 길가에 버려지는 법이지. 네놈들이 지은 죄가 발목을 잡아 곧 낮도깨비 귀신이 네놈들 보따리를 채갈 것이야. 더럽힌 발을 얼른 떼고 썩 물러가지 못할까! 내 눈에 흙이 들어가기 전엔 네놈들 꼴은 절대 못 본다!
```

**스타일링:**
```typescript
<div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-8">
  <p className="text-red-600 text-2xl md:text-4xl font-bold leading-relaxed text-center break-keep">
    {curseText}
  </p>
</div>
```

**CSS 예시:**
```css
.dokkaebi-curse-text {
  color: #dc2626; /* red-600 */
  font-size: 2rem; /* 모바일 */
  font-weight: 700;
  line-height: 1.625;
  text-align: center;
  word-break: keep-all;
  animation: curse-appear 0.5s ease-out;
}

@media (min-width: 768px) {
  .dokkaebi-curse-text {
    font-size: 2.25rem; /* 데스크톱 */
  }
}

@keyframes curse-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 4단계: 강제 로그아웃

**타이밍:** 텍스트 표시 3초 후

**동작:**
1. 세션 스토리지 클리어 (또는 로그아웃 처리)
2. 인증 상태 초기화
3. `/login` 경로로 강제 리다이렉트

**구현 방법:**
```typescript
// 3초 후 실행
setTimeout(() => {
  // 1. 로그아웃 처리
  useAuthStore.getState().logout();

  // 2. 상호작용 데이터 초기화 (선택 사항)
  useInteractionStore.getState().resetInteractions();

  // 3. 로그인 화면으로 리다이렉트
  navigate('/login', { replace: true });
}, 3000);
```

---

## 🛠️ 구현 가이드

### 파일 구조

```
src/
├── constants/
│   └── easterEggs.ts                    [수정] 백일몽 직원 이름 목록 추가
├── store/
│   └── interactionStore.ts              [수정] 트리거 횟수 추적 로직 추가
├── pages/
│   └── MessagesPage.tsx                 [수정] 발송 로직 수정
├── components/
│   └── easter-eggs/
│       └── DokkaebiCurseModal.tsx       [신규] 2회 트리거 전체 화면 컴포넌트
└── hooks/
    └── useDokkaebiTrigger.ts            [신규] 트리거 감지 및 처리 훅 (선택)
```

### 1. 상수 정의 (`src/constants/easterEggs.ts`)

```typescript
// 기존 코드 하단에 추가

/**
 * 백일몽 주식회사 배신자 목록
 * 이 이름들로 쪽지를 보내려 하면 도깨비가 개입함
 */
export const BAEKILLMONG_EMPLOYEES = [
  '백석주', '진나솔', '이성해', '이자헌', '은하제',
  '박민성', '백사헌', '강이학', '이석종', '강도준',
  '윤조훈', '이재진', '이승조', '곽제강', '최명진',
  '박경환', '이병진', '김허운', '이허운'
] as const;

/**
 * 받는 사람 이름이 백일몽 직원인지 확인
 */
export const isBaekillmongEmployee = (recipientName: string): boolean => {
  const trimmedName = recipientName.trim();
  return BAEKILLMONG_EMPLOYEES.includes(trimmedName as any);
};

/**
 * 도깨비 경고 쪽지 내용
 */
export const DOKKAEBI_WARNING_MESSAGE = `어허, 저기 낯짝 두꺼운 것들 좀 보게! 나랏일 한다고 으스대더니 속은 시커먼 숯검정이로구나. 배신질로 배를 채우려거든 저기 들개들이나 찾아갈 것이지, 어디라고 감히 또 발을 들이밀어!

내 오늘 우리 김서방의 너그러운 낯을 봐서, 딱 이번 한 번만! 정말이지 이번 딱 한 번만 눈 감아주마. 허나 명심하거라. 이 도깨비 방망이는 두 번 참는 법이 없느니라!

또다시 신의를 저버리고 뒤통수를 칠 생각일랑 아예 접는 게 좋을 게야. 그때는 내 이 방망이가 네놈들 정수리를 가만두지 않을 것이니, 국물도 없을 줄 알아라! 알았으면 그 비겁한 낯짝 치우고 어서 썩 물러가거라! 에잇, 퉤! 재수 없으니 소금이라도 뿌려야겠구먼!`;

/**
 * 도깨비 저주 텍스트
 */
export const DOKKAEBI_CURSE_TEXT = `누구냐! 거기서 뒤를 돌아보는 놈이 누구냐! 은혜를 원수로 갚은 놈들은 저승길도 아까워 길가에 버려지는 법이지. 네놈들이 지은 죄가 발목을 잡아 곧 낮도깨비 귀신이 네놈들 보따리를 채갈 것이야. 더럽힌 발을 얼른 떼고 썩 물러가지 못할까! 내 눈에 흙이 들어가기 전엔 네놈들 꼴은 절대 못 본다!`;
```

### 2. 상태 관리 (`src/store/interactionStore.ts`)

```typescript
interface InteractionState {
  // 기존 필드들...
  triggeredIds: string[];
  sessionMessages: Message[];

  // 추가 필드
  baekillmongTriggerCount: number;  // 0, 1, 2...

  // 기존 액션들...

  // 추가 액션들
  incrementBaekillmongTrigger: () => void;
  removeSessionMessage: (messageId: string) => void;
}

export const useInteractionStore = create<InteractionState>()(
  persist(
    (set, get) => ({
      // 기존 상태...
      triggeredIds: [],
      sessionMessages: [],

      // 추가 상태
      baekillmongTriggerCount: 0,

      // 기존 액션들...

      // 백일몽 트리거 횟수 증가
      incrementBaekillmongTrigger: () => {
        set(state => ({
          baekillmongTriggerCount: state.baekillmongTriggerCount + 1
        }));
      },

      // 세션 메시지 삭제 (경고 쪽지 읽음 처리용)
      removeSessionMessage: (messageId: string) => {
        set(state => ({
          sessionMessages: state.sessionMessages.filter(msg => msg.id !== messageId)
        }));
      },

      // 기존 resetInteractions 수정
      resetInteractions: () => {
        set({
          triggeredIds: [],
          readIds: [],
          sessionMessages: [],
          newlyTriggeredId: null,
          baekillmongTriggerCount: 0,  // 추가
        });
      },
    }),
    {
      name: 'interaction-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

### 3. 쪽지 발송 로직 수정 (`src/pages/MessagesPage.tsx`)

```typescript
import { isBaekillmongEmployee, DOKKAEBI_WARNING_MESSAGE } from '@/constants/easterEggs';
import { useInteractionStore } from '@/store/interactionStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const MessagesPage = () => {
  const navigate = useNavigate();
  const agent = useAuthStore(state => state.agent);
  const {
    sendMessage,
    addSessionMessage,
    incrementBaekillmongTrigger,
    baekillmongTriggerCount
  } = useInteractionStore();

  const [showDokkaebiCurse, setShowDokkaebiCurse] = useState(false);

  const handleSendMessage = () => {
    if (!agent) return;

    const recipientName = newMessage.recipient.trim();

    // 백일몽 직원 체크
    if (isBaekillmongEmployee(recipientName)) {
      // 트리거 횟수 증가
      incrementBaekillmongTrigger();
      const currentCount = baekillmongTriggerCount + 1; // 증가 직후 값

      if (currentCount === 1) {
        // 1회 트리거: 경고 쪽지
        handleFirstTrigger(recipientName);
      } else if (currentCount >= 2) {
        // 2회 이상 트리거: 저주 + 강제 로그아웃
        handleSecondTrigger();
      }

      return; // 일반 발송 로직 중단
    }

    // 일반 쪽지 발송 (기존 로직)
    sendMessage(agent, newMessage.recipient, newMessage.title, newMessage.content)
      .then(() => {
        toast({ title: '전송 완료', description: '쪽지가 전송되었습니다.' });
        setNewMessage({ recipient: '', title: '', content: '' });
        setIsComposeOpen(false);
      });
  };

  // 1회 트리거 처리
  const handleFirstTrigger = (recipientName: string) => {
    // 1. 마스킹된 쪽지 발송
    const maskedMessage: Message = {
      id: `msg-sent-${Date.now()}`,
      senderId: agent!.id,
      senderName: agent!.name,
      senderDepartment: agent!.department,
      receiverId: '■■■(알 수 없음)',
      title: newMessage.title,
      content: newMessage.content,
      createdAt: new Date(),
      isRead: true
    };

    addSessionMessage(maskedMessage);

    // 2. 다이얼로그 닫기
    setIsComposeOpen(false);
    setNewMessage({ recipient: '', title: '', content: '' });

    // 3. 발송 완료 토스트
    toast({
      title: '전송 완료',
      description: '쪽지가 전송되었습니다.'
    });

    // 4. 5초 후 경고 쪽지 도착
    setTimeout(() => {
      const warningMessage: Message = {
        id: `msg-dokkaebi-warning-${Date.now()}`,
        senderId: 'dokkaebi',
        senderName: '魑魅',
        senderDepartment: '',
        receiverId: agent!.id,
        title: '경고',
        content: DOKKAEBI_WARNING_MESSAGE,
        createdAt: new Date(),
        isRead: false
      };

      addSessionMessage(warningMessage);

      // 토스트 알림
      toast({
        title: '새로운 쪽지',
        description: '魑魅님으로부터 쪽지가 도착했습니다',
        variant: 'default'
      });
    }, 5000);
  };

  // 2회 트리거 처리
  const handleSecondTrigger = () => {
    // 다이얼로그 닫기
    setIsComposeOpen(false);
    setNewMessage({ recipient: '', title: '', content: '' });

    // 저주 모달 표시
    setShowDokkaebiCurse(true);
  };

  return (
    <div>
      {/* 기존 UI */}

      {/* 도깨비 저주 모달 */}
      {showDokkaebiCurse && (
        <DokkaebiCurseModal
          onComplete={() => {
            // 로그아웃 + 리다이렉트
            useAuthStore.getState().logout();
            navigate('/login', { replace: true });
          }}
        />
      )}
    </div>
  );
};
```

### 4. 도깨비 저주 모달 컴포넌트 (`src/components/easter-eggs/DokkaebiCurseModal.tsx`)

```typescript
import { useEffect, useState } from 'react';
import { DOKKAEBI_CURSE_TEXT } from '@/constants/easterEggs';

interface DokkaebiCurseModalProps {
  onComplete: () => void;
}

export const DokkaebiCurseModal = ({ onComplete }: DokkaebiCurseModalProps) => {
  const [phase, setPhase] = useState<'yellow' | 'black' | 'curse'>('yellow');

  useEffect(() => {
    // Phase 1: 황색 UI (3초)
    const yellowTimer = setTimeout(() => {
      setPhase('black');
    }, 3000);

    // Phase 2: 검은 화면 (즉시)
    const blackTimer = setTimeout(() => {
      setPhase('curse');
    }, 3000);

    // Phase 3: 저주 텍스트 (3초 후 종료)
    const curseTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(yellowTimer);
      clearTimeout(blackTimer);
      clearTimeout(curseTimer);
    };
  }, [onComplete]);

  return (
    <>
      {/* Phase 1: 황색 필터 */}
      {phase === 'yellow' && (
        <div className="fixed inset-0 bg-yellow-500/30 z-[9998] animate-pulse pointer-events-none" />
      )}

      {/* Phase 2 & 3: 검은 화면 + 저주 텍스트 */}
      {(phase === 'black' || phase === 'curse') && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-8">
          {phase === 'curse' && (
            <p className="text-red-600 text-2xl md:text-4xl font-bold leading-relaxed text-center break-keep animate-in fade-in duration-500">
              {DOKKAEBI_CURSE_TEXT}
            </p>
          )}
        </div>
      )}
    </>
  );
};
```

### 5. 경고 쪽지 읽음 처리 (`src/pages/MessagesPage.tsx`)

```typescript
// 쪽지 클릭 시
const handleMessageClick = (message: Message) => {
  // 읽음 처리
  markAsRead(message.id);

  // 도깨비 경고 쪽지는 읽으면 삭제
  if (message.id.startsWith('msg-dokkaebi-warning-')) {
    removeSessionMessage(message.id);
  }

  // 쪽지 상세 표시 (기존 로직)
  setSelectedMessage(message);
};
```

---

## 🧪 테스트 시나리오

### 테스트 1: 1회 트리거

1. 로그인
2. 쪽지함 → 쪽지 작성
3. 받는 사람: `백석주` 입력
4. 제목, 내용 임의 입력
5. **발송** 버튼 클릭

**예상 결과:**
- ✅ 발송 완료 토스트 표시
- ✅ 보낸 쪽지함에 쪽지 표시 (수신자: `■■■(알 수 없음)`)
- ✅ 5초 후 새로운 쪽지 도착 토스트
- ✅ 받은 쪽지함에 魑魅의 경고 쪽지 표시
- ✅ 경고 쪽지 클릭 시 읽음 처리 후 삭제

### 테스트 2: 2회 트리거

1. 위 테스트 1 완료 후
2. 다시 쪽지 작성
3. 받는 사람: `진나솔` 입력 (다른 백일몽 직원)
4. 제목, 내용 임의 입력
5. **발송** 버튼 클릭

**예상 결과:**
- ✅ 화면 전체가 황색으로 3초간 변화
- ✅ 검은 화면으로 전환
- ✅ 도깨비 저주 텍스트 표시 (3초)
- ✅ 로그인 화면으로 강제 리다이렉트

### 테스트 3: 일반 쪽지 발송

1. 로그인
2. 쪽지 작성
3. 받는 사람: `박홍림` 입력 (일반 요원)
4. **발송** 버튼 클릭

**예상 결과:**
- ✅ 정상적으로 쪽지 발송
- ✅ 이스터에그 트리거 안 됨

### 테스트 4: 공백 처리

1. 받는 사람: ` 백석주 ` (앞뒤 공백 포함)
2. **발송** 버튼 클릭

**예상 결과:**
- ✅ 공백 무시하고 정상 트리거

### 테스트 5: 세션 유지 확인

1. 1회 트리거 후
2. 페이지 새로고침
3. 다시 백일몽 직원에게 쪽지 발송

**예상 결과:**
- ✅ 2회 트리거 동작 (세션 스토리지에 카운트 유지됨)

---

## 📝 주의사항

### 구현 시 체크리스트

- [ ] 백일몽 직원 이름 목록 19명 정확히 입력
- [ ] 대소문자, 공백 처리 로직 구현
- [ ] 트리거 횟수가 sessionStorage에 저장되는지 확인
- [ ] 경고 쪽지 읽음 시 삭제 로직 구현
- [ ] 2회 트리거 시 로그아웃 처리 확인
- [ ] 모바일 반응형 확인 (저주 텍스트 줄바꿈)
- [ ] z-index 충돌 확인 (9998, 9999)
- [ ] 애니메이션 타이밍 정확히 구현 (3초, 5초)

### 디버깅 팁

```typescript
// 개발 중 트리거 횟수 확인
console.log('Baekillmong trigger count:', useInteractionStore.getState().baekillmongTriggerCount);

// 트리거 횟수 초기화 (테스트용)
useInteractionStore.getState().resetInteractions();
```

### 선택적 개선 사항

1. **사운드 효과**: 황색 UI 변화 시 불길한 사운드 추가
2. **진동 효과**: 모바일에서 navigator.vibrate() 호출
3. **애니메이션 강화**: 텍스트 타이핑 효과, 글리치 효과
4. **3회 이상 트리거**: 계정 일시 정지, 특별한 페널티 등

---

## 🔗 관련 파일

- `src/constants/easterEggs.ts` - 이스터에그 상수
- `src/store/interactionStore.ts` - 상태 관리
- `src/pages/MessagesPage.tsx` - 쪽지 UI 및 발송 로직
- `src/components/easter-eggs/DokkaebiCurseModal.tsx` - 저주 모달 (신규)

---

## 📅 작성일

2026-01-13

## 📌 상태

**구현 대기 중**

---

**구현 시 이 문서를 참조하여 단계별로 진행하세요.**
