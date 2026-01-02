# 🛠 프론트엔드 개발 가이드 (Developer Guide)

본 문서는 해태 시스템 개발 시 유의해야 할 프론트엔드 주의사항을 정리한 가이드입니다.

---

## 0. 문서 기반 개발 원칙 (Documentation-Driven Development)

**모든 코드 작업은 명세서를 기반으로 진행되어야 합니다.**

### 📚 핵심 명세서 (Source of Truth)

| 문서 | 역할 | 참조 시점 |
|------|------|----------|
| **specification.md** | 시스템 전체 설계 및 기능 정의 | 새로운 기능 개발 시 |
| **DATA_SPECIFICATION.md** | 데이터 구조 및 연동 규칙 | 데이터 추가/수정 시 |
| **DEVELOPER_GUIDE.md** (본 문서) | 개발 시 주의사항 및 패턴 | 코드 구현 시 |

### 🔄 작업 프로세스

#### 1️⃣ 기능 개발 시
```
specification.md 확인
  ↓
기능 요구사항 파악
  ↓
타입 정의 (types/haetae.ts)
  ↓
상수 정의 (constants/haetae.tsx)
  ↓
컴포넌트 구현
  ↓
명세서와 일치 여부 검증
```

#### 2️⃣ 데이터 작업 시
```
DATA_SPECIFICATION.md 확인
  ↓
데이터 연동 규칙 파악
  ↓
JSON 파일 수정
  ↓
연동 체크리스트 검증 (섹션 5.5)
  ↓
DataManager 동작 테스트
```

### ⚠️ 필수 규칙

1. **명세서 우선**: 명세서에 없는 기능/데이터는 구현하지 않음
2. **명세서 동기화**: 코드 변경 시 관련 명세서도 함께 업데이트
3. **타입 안정성**: 명세서의 타입 정의가 `types/haetae.ts`와 일치해야 함
4. **데이터 검증**: `DATA_SPECIFICATION.md` 섹션 5.5 체크리스트 필수 확인

### 📝 작업 전 체크리스트

**기능 개발 전**:
- [ ] specification.md에서 해당 기능 명세 확인
- [ ] 관련 타입이 types/haetae.ts에 정의되어 있는지 확인
- [ ] UI 컴포넌트가 shadcn/ui 기반인지 확인
- [ ] 인증/권한이 필요한 기능인지 확인

**데이터 작업 전**:
- [ ] DATA_SPECIFICATION.md의 데이터 구조 확인
- [ ] ID 명명 규칙 준수 (섹션 5.1)
- [ ] 쌍방향 연동 필요 여부 확인 (섹션 5.2)
- [ ] 관계형 필드 추가 필요 여부 확인 (섹션 5.3)

**작업 완료 후**:
- [ ] 데이터 일관성 검증 체크리스트 확인 (DATA_SPECIFICATION.md 섹션 5.5)
- [ ] 명세서와 코드가 일치하는지 확인
- [ ] 변경된 내용을 명세서에 반영

---

## 1. 타입-데이터-상수 동기화 원칙

새로운 값을 추가할 때 **세 곳을 모두 업데이트**해야 합니다.

| 레이어 | 파일 | 역할 |
|--------|------|------|
| **타입 정의** | `src/types/haetae.ts` | TypeScript 타입 검사 |
| **데이터** | `src/data/**/*.json` | 실제 값 |
| **스타일 상수** | `src/constants/haetae.tsx` | UI 렌더링용 스타일 매핑 |

### 예시: 새로운 `IncidentStatus` 추가 시

```typescript
// 1️⃣ types/haetae.ts
export type IncidentStatus = '접수' | '조사중' | ... | '봉인';  // ← 추가

// 2️⃣ constants/haetae.tsx
export const STATUS_STYLE: Record<IncidentStatus, {...}> = {
  ...
  '봉인': { bgClass: 'bg-abyssal', textClass: 'text-abyssal-foreground' },  // ← 추가
};

// 3️⃣ data/*.json
{ "status": "봉인" }  // ← 사용
```

> ⚠️ **누락 시 런타임 에러 발생** → `Cannot read properties of undefined` → 하얀 화면

---

## 2. 스타일 매핑 객체 안전 접근

스타일 객체 접근 시 `undefined` 방어 코드 권장:

```tsx
// ❌ 위험한 패턴
const style = STATUS_STYLE[status];
return <span className={style.bgClass}>...</span>;

// ✅ 안전한 패턴
const style = STATUS_STYLE[status] ?? { bgClass: 'bg-muted', textClass: 'text-muted-foreground' };
return <span className={style.bgClass}>...</span>;
```

---

## 3. 데이터 매니저 활용

**절대 JSON 파일을 직접 import하지 마세요.** 항상 `DataManager`를 통해 접근:

```tsx
// ❌ 잘못된 방법
import incidents from '@/data/global/incidents.json';

// ✅ 올바른 방법
import { DataManager } from '@/data/dataManager';
const incidents = DataManager.getIncidents(agent);
```

**이유**: DataManager가 날짜 파싱, 데이터 병합(Global + Persona) 등을 처리함

---

## 4. 날짜 데이터 처리

JSON에서 가져온 날짜는 **문자열**입니다. 반드시 `Date` 객체로 변환:

```tsx
// JSON: "2025-12-31T09:00:00"

// ✅ 변환 필요
const date = new Date(incident.createdAt);
format(date, 'yyyy-MM-dd');
```

`DataManager`가 자동으로 변환하지만, 직접 JSON 데이터를 다룰 경우 주의

---

## 5. 세션 스토리지 키 관리

일관된 키 네이밍 규칙 사용:

```typescript
const SESSION_STORAGE_KEY = 'haetae_agent_session';
const RESERVATION_STORAGE_KEY = 'haetae_reservations';
```

- 접두사 `haetae_` 사용
- 소문자 + 언더스코어

---

## 6. 특수 페르소나 처리

`'최요원'`, `'해금'`은 **원작 설정상 가명**이므로 일반 로그인 차단:

```typescript
const SPECIAL_PERSONAS = ['최요원', '해금'];
const EMERGENCY_CALL_NUMBER = '1717828242';
```

해당 이름으로 로그인 시 → 긴급 인증 절차 필요

---

## 7. 컴포넌트 에러 방어

React 컴포넌트에서 `undefined` 접근 시 전체 앱 크래시 방지:

```tsx
// 조건부 렌더링
{selectedIncident && (
  <Badge className={STATUS_STYLE[selectedIncident.status]?.bgClass}>
    {selectedIncident.status}
  </Badge>
)}
```

---

## 8. 파일 구조 규칙

```
src/
├── components/     # 재사용 가능 UI 컴포넌트
├── pages/          # 라우트별 페이지 컴포넌트
├── contexts/       # React Context (인증 등)
├── data/           # JSON 데이터 + DataManager
├── types/          # TypeScript 타입 정의
├── constants/      # 상수 및 스타일 매핑
└── utils/          # 유틸리티 함수
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-02 | 초안 작성 (STATUS_STYLE 동기화 이슈 기반) |
