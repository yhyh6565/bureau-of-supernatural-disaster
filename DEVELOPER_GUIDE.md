# 🛠 프론트엔드 개발 가이드 (Developer Guide)

본 문서는 해태 시스템 개발 시 유의해야 할 프론트엔드 주의사항을 정리한 가이드입니다.

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
