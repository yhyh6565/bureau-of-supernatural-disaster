# 🗄️ 해태 시스템 데이터 명세서 (Data Specification v1.1)

본 문서는 초자연재난관리국 인트라넷 시스템 '해태'의 데이터 구조, 저장 방식, 관리 규칙을 정의한 통합 명세서입니다.

**변경 이력**:
- **v1.1 (2026-01-02)**: Agent 타입에 `personaKey` 필드 추가, 페르소나 키 개념 및 데이터 필터링 규칙 명시
- **v1.0 (2026-01-01)**: 초기 버전

---

## 1. 데이터 아키텍처 개요

### 1.1 저장 방식 (JSON)
모든 데이터는 TypeScript 코드(`src/data/*.ts`)에서 **JSON 파일(`src/data/**/*.json`)**로 이관되었습니다 (v5.0, 2026-01-01).

- **날짜 처리**: JSON에는 ISO 8601 문자열(`"2025-12-31T09:00:00"`)로 저장되며, `DataManager`가 로드 시 자동으로 JavaScript `Date` 객체로 변환합니다.
- **타입 정의**: `src/types/haetae.ts`에 정의된 인터페이스를 따릅니다.
- **상수(Enum) 값**: `src/constants/haetae.ts`의 설정값을 참조합니다.

### 1.2 폴더 구조
데이터는 성격에 따라 3가지 계층으로 분리되어 저장됩니다.

```
src/data/
├── global/          # [전사 공통] 모든 요원에게 동일하게 보임
│   ├── incidents.json
│   ├── notifications.json
│   ├── equipment.json
│   ├── locations.json
│   └── manuals.json     # 재난 대응 매뉴얼
├── ordinary/        # [일반 요원] 네임드 페르소나가 아닌 경우 사용
│   ├── messages.json
│   ├── approvals.json
│   ├── schedules.json
│   └── incidents.json (확장용)
└── personas/        # [페르소나] 특정 캐릭터(박홍림, 최요원 등) 전용
    └── {character_name}/
        ├── incidents.json
        ├── messages.json
        ├── notifications.json
        ├── approvals.json
        └── schedules.json
```

### 1.3 데이터 수명 주기 (Data Lifecycle)
데이터는 저장 방식과 수명에 따라 두 가지로 분류됩니다.

#### Type A: 정적 데이터 (Static JSON)
- **소스**: `src/data/**/*.json`
- **특징**: 빌드 및 배포 시점에 고정되는 **Read-only** 데이터.
- **용도**: 기본 재난 시나리오, 장비 목록, 페르소나 초기 설정값.

#### Type B: 세션 데이터 (Session State)
- **소스**: `AuthContext` (React State) + `sessionStorage`
- **특징**: 런타임에 생성되며, **단일 로그인 세션** 동안만 유지되는 **Read/Write** 데이터.
- **용도**:
  - **Rentals**: 사용자가 추가로 신청한 장비 대여 기록
  - **Schedules**: 사용자가 추가한 방문 예약 및 업무 일정
  - **Approvals**: 사용자가 기안한 결재 문서
- **보안 정책**: 로그아웃 시 휘발성 메모리에서 즉시 제거되어야 함.

---

## 2. 데이터 접근 (DataManager)

애플리케이션은 **`src/data/dataManager.ts`**를 통해서만 데이터에 접근해야 합니다. 절대 JSON 파일을 직접 import 하지 마십시오.

### 주요 메서드
| 메서드 | 설명 | 병합 로직 |
|--------|------|-----------|
| `getIncidents(agent)` | 재난 목록 조회 | 전사 공통 + (페르소나 전용 OR 일반 요원용) |
| `getNotifications(agent)` | 공지사항 조회 | 전사 공통 + (페르소나 전용) |
| `getMessages(agent)` | 쪽지함 조회 | (페르소나 전용 OR 일반 요원용) **단독** |
| `getApprovals(agent)` | 결재문서 조회 | (페르소나 전용 OR 일반 요원용) **단독** |
| `getSchedules(agent)` | 일정 조회 | (페르소나 전용 OR 일반 요원용) **단독** |
| `getEquipment()` | 장비 목록 조회 | 전사 공통 **단독** |
| `getLocations()` | 방문 장소 조회 | 전사 공통 **단독** |
| `getManuals()` | 매뉴얼 목록 조회 | 전사 공통 **단독** |
| `getManualById(id)` | 특정 매뉴얼 조회 | 전사 공통 **단독** |
| `getStats()` | 통계 데이터 조회 | **전사 공통(GLOBAL) 단독** (중복 방지) |

### 통계 데이터 처리 (Statistics)
대시보드 통계(`getStats`)는 데이터 일관성을 위해 **전사 공통 데이터(GLOBAL_INCIDENTS)**만을 사용하여 계산합니다.
- 개인별/페르소나별 데이터는 사용자가 보는 View 일뿐이며, 통계 집계 시에는 중복을 방지하기 위해 제외됩니다.

---

## 3. 핵심 데이터 스키마 (Schema)

모든 타입 정의의 원본(Source of Truth)은 **`src/types/haetae.ts`**입니다.

### 3.1 ⚠️ 재난 (Incident)
시스템의 핵심이 되는 초자연적 사건/재난 데이터입니다.

- **JSON 파일**: `global/incidents.json`, `personas/*/incidents.json`
- **주요 필드**:
  ```typescript
  interface Incident {
    id: string;                 // 예: "inc-001"
    title: string;              // 재난 명칭 (예: "시간의 틈")
    caseNumber: string;         // 내부 관리 번호 "20251231-001"
    registrationNumber: string; // 공식 등록번호 "0000PSYA.연도.가00"
    location: string;           // 발생 위치
    dangerLevel: DangerLevel;   // "멸형" | "파형" | "뇌형" | "고형"
    status: IncidentStatus;     // "접수" -> "조사중" -> "구조대기" ... -> "종결"
    reportContent: string;      // 제보 내용
    requiresPatrol: boolean;    // 정기 순찰 필요 여부
    countermeasure?: string;    // [특수] 파훼법 (조사 완료 시)
    entryRestrictions?: string; // [특수] 진입 제한 사항
    manualId?: string;          // 연결된 대응 매뉴얼 ID
    createdAt: Date;
    updatedAt: Date;
  }
  ```

### 3.2 📝 결재 문서 (ApprovalDocument)
업무 승인 및 보고 체계 데이터입니다.

- **JSON 파일**: `ordinary/approvals.json`, `personas/*/approvals.json`
- **주요 필드**:
  ```typescript
  interface ApprovalDocument {
    id: string;
    type: string;        // "조사보고서", "출동일지", "장비품의서" 등
    status: string;      // "작성중", "결재대기", "승인", "반려"
    createdBy: string;   // 기안자 페르소나 키 (예: "choiyowon")
    createdByName: string;
    approver: string;    // 결재자 ID
    approverName: string;
    content: string;     // 본문
    createdAt: Date;
    processedAt?: Date;
    // ...
  }
  ```
- **참고**: `createdBy`는 Agent의 `personaKey`를 사용합니다 (5.1 참조)

### 3.3 💌 쪽지 (Message)
사내 메신저 데이터입니다.

- **JSON 파일**: `ordinary/messages.json`, `personas/*/messages.json`
- **주요 필드**:
  ```typescript
  interface Message {
    id: string;
    senderId: string;        // 발신자 페르소나 키 (예: "solum", "choiyowon")
    senderName: string;      // 발신자 이름
    senderDepartment: string;
    receiverId: string;      // 수신자 페르소나 키 (예: "koyoungeun")
    title: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
  }
  ```
- **참고**: `senderId`와 `receiverId`는 Agent의 `personaKey`를 사용합니다 (5.1 참조)

### 3. Equipment (장비)
*   **파일**: `src/data/global/equipment.json`
*   **설명**: 대여 가능 장비 및 지급 물품
*   **구조**:
    ```json
    {
      "id": "string",
      "name": "string",
      "category": "대여" | "지급",
      "requiresApproval": boolean,
      "description": "string",
      "totalStock": number,
      "availableStock": number
    }
    ```

### 4. VisitLocation (방문 장소)
*   **파일**: `src/data/global/locations.json`
*   **설명**: 예약 가능한 시설 정보
*   **구조**:
    ```json
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "requiresApproval": boolean,
      "operatingHours": "string"
    }
    ```

### 5. RentalRecord (대여/지급 기록)
*   **설명**: `Agent` 객체 내부에 포함되는 개인 자산 현황
*   **구조**:
    ```typescript
    interface RentalRecord {
      id: string;
      equipmentName: string;
      category: '대여' | '지급';
      rentalDate: Date;
      dueDate?: Date;
      status: '정상' | '연체' | '반납완료';
    }
    ```

### 6. InspectionRequest (오염 검사)
*   **설명**: `ResourcesPage` 오염 검사 탭에서 생성되는 데이터
*   **구조**:
    ```typescript
    interface InspectionRequest {
        id: string;
        agentId: string;
        type: '정기검사' | '정밀검사' | '긴급검사';
        status: '신청' | '접수' | '완료';
        scheduledDate: Date;
        symptoms?: string;
        result?: string;
    }
    ```

    ```

### 7. Manual (재난 대응 매뉴얼)
*   **파일**: `src/data/global/manuals.json`
*   **설명**: 특정 재난에 대한 상세 대응 수칙 및 금기 사항
*   **연동**: `Incident.manualId`와 `Manual.id`로 연결
*   **구조**:
    ```typescript
    interface ManualContent {
      identification: string;       // 식별 징후
      immediateAction: string[];    // 즉각 대응 행동
      taboo: string[];              // 금기 사항
    }

    interface Manual {
      id: string;
      title: string;
      severity: DangerLevel;
      clearanceLevel: number;       // 열람 등급
      lastUpdated: Date;
      content: ManualContent;
      containmentMethod?: string;   // 봉인법
      aftermath?: string;           // 사후 처리
      relatedIncidentIds?: string[]; // 관련 과거 사례
    }
    ```

---

## 4. 상수 및 설정값 (Constants)

코드 내 하드코딩을 방지하기 위해 **`src/constants/haetae.ts`**에서 관리합니다.

### 장례 방식 (FUNERAL_OPTIONS)
요원 사망 시 처리 절차에 대한 선택지입니다.
- 화장, 매장, 수목장
- 데이터 소각 (기록 말소)
- 기억 소거 후 방생

---

## 5. 데이터 연동 규칙 (Data Synchronization Rules)

### 5.1 ID 관리 체계

**원칙**: 모든 엔티티는 전역적으로 고유한 ID를 가져야 합니다.

#### ID 명명 규칙
- **페르소나 전용 데이터**: `{type}-{persona}-{number}` 형식 사용
  - 예: `msg-choiyowon-001`, `appr-haegeum-009`
- **전역 공유 데이터**: `{type}-{number}` 형식 사용
  - 예: `inc-003`, `noti-001`
- **동일 이벤트 공유**: 같은 사건/일정/알림을 여러 사람이 공유하는 경우, 모든 페르소나에서 동일한 ID 사용

#### 금지 사항
- 서로 다른 내용을 가진 데이터가 같은 ID를 사용하는 것
- 예: `appr-005`가 choiyowon과 ryujaegwan에서 각각 다른 결재 문서를 가리키는 경우

#### 페르소나 키 (Persona Key)와 Agent ID

**페르소나 키**는 각 요원을 데이터 관계에서 식별하는 데 사용되는 고유 문자열입니다.

**Agent 타입 확장 (v1.1, 2026-01-02)**:
```typescript
interface Agent {
  id: string;              // 공식 요원 ID (예: "HMU-004", "BKH-201")
  name: string;            // 요원 이름
  personaKey?: string;     // 페르소나 고유 키 (예: "solum", "choiyowon")
  // ... 기타 필드
}
```

**사용 규칙**:
- **페르소나 키 사용처**: `senderId`, `receiverId`, `createdBy`, `attendees`, `assignedTo` 등 데이터 간 관계를 나타내는 모든 ID 필드
- **Agent ID (공식 ID) 사용처**: 시스템 내부 식별, UI 표시용
- **네임드 페르소나**: 특정 스토리를 가진 캐릭터 (박홍림, 최요원, 류재관, 김솔음, 해금, 고영은, 장허운)는 고유한 personaKey를 가짐
  - 예: 김솔음의 경우 `id: "HMU-004"`, `personaKey: "solum"`
- **일반 요원**: 동적으로 생성된 요원은 personaKey가 없을 수 있음

**데이터 필터링 예시**:
```typescript
// 받은 쪽지 필터링
const receivedMessages = messages.filter(m =>
  m.receiverId === agent?.personaKey || m.receiverId === agent?.id
);

// 내가 작성한 결재 문서 필터링
const myApprovals = approvals.filter(a =>
  a.createdBy === agent?.personaKey || a.createdBy === agent?.id
);
```

### 5.2 쌍방향 연동 (Bidirectional Sync)

#### 메시지 (Messages)
- **원칙**: 발신자와 수신자 양쪽 모두에게 동일한 메시지가 존재해야 함
- **ID**: 발신자와 수신자 모두 동일한 ID 사용
- **필드 구분**:
  - `senderId`: 발신자 ID
  - `receiverId`: 수신자 ID
  - 발신자 쪽에서는 `senderId = "본인"`, 수신자 쪽에서는 `receiverId = "본인"`

**예시**:
```json
// solum/messages.json (발신)
{
  "id": "msg-022",
  "senderId": "solum",
  "receiverId": "koyoungeun",
  "title": "점심 식사 제안",
  "isRead": true
}

// koyoungeun/messages.json (수신)
{
  "id": "msg-022",
  "senderId": "solum",
  "receiverId": "koyoungeun",
  "title": "점심 식사 제안",
  "isRead": true
}
```

#### 결재 (Approvals)
- **원칙**: 기안자와 결재자(들) 모두에게 동일한 결재 문서가 존재해야 함
- **필수 필드**:
  - `createdBy`: 기안자 ID
  - `approver`: 최종 결재자 ID
  - `approvalLine`: 결재선상의 모든 결재자 ID 배열

**예시**:
```json
{
  "id": "appr-choiyowon-005",
  "createdBy": "choiyowon",
  "approver": "agent-team-lead",
  "approvalLine": ["agent-team-lead"],
  "status": "결재대기"
}
```

#### 일정 (Schedules)
- **원칙**: 참석자 모두에게 동일한 일정이 존재해야 함
- **필수 필드**:
  - `attendees`: 모든 참석자 ID 배열

**예시**:
```json
{
  "id": "sch-010",
  "title": "신년 시무식",
  "attendees": ["choiyowon", "haegeum", "ryujaegwan", "parkhonglim"],
  "date": "2026-01-02T10:00:00"
}
```

### 5.3 관계형 필드 (Relational Fields)

#### 사건 담당자
- **필드**: `assignedTo` (배열)
- **설명**: 해당 사건을 담당하는 모든 요원의 ID
- **예시**:
```json
{
  "id": "inc-003",
  "title": "망원동 놀이터 이상 현상",
  "assignedTo": ["choiyowon", "parkhonglim", "ryujaegwan", "solum"],
  "status": "조사중"
}
```

#### 결재 관련
- **기안자와의 연동**: `createdBy` 필드로 기안자를 명시하고, 기안자의 approvals.json에 해당 결재가 존재해야 함
- **결재자와의 연동**: `approvalLine`에 명시된 모든 결재자의 데이터에 해당 결재가 존재해야 함 (또는 결재함에서 확인 가능해야 함)

#### 휴가 연동
- **원칙**: 승인된 휴가 신청서(`approvals.json`)는 반드시 해당 날짜의 일정(`schedules.json`)으로도 존재해야 함
- **연결**: 일정의 `relatedId` 필드에 결재 문서 ID 명시

**예시**:
```json
// approvals.json
{
  "id": "appr-ryujaegwan-010",
  "type": "휴가신청서",
  "status": "승인",
  "createdAt": "2025-08-11T09:00"
}

// schedules.json
{
  "id": "sch-ryujaegwan-016",
  "title": "연차",
  "type": "휴가",
  "date": "2025-08-11T00:00:00",
  "relatedId": "appr-ryujaegwan-010"
}
```

### 5.4 알림 배포 규칙

#### 전역 알림
- **위치**: `global/notifications.json`
- **배포 대상**:
  - `targetDepartment`가 지정된 경우: 해당 부서 소속 페르소나에게만 배포
  - `isImportant: true` 또는 "전 직원" 대상: 모든 페르소나에게 배포
- **페르소나 데이터**: 전역 알림은 각 페르소나의 `notifications.json`에도 복사되어야 함

#### 개인 알림
- **위치**: `personas/{name}/notifications.json`
- **용도**: 특정 개인에게만 발송되는 알림 (업무 지시, 개인 통보 등)

### 5.5 데이터 일관성 검증 체크리스트

새로운 데이터를 추가하거나 수정할 때 다음을 확인하십시오:

- [ ] 모든 ID가 전역적으로 고유한가?
- [ ] 메시지: 발신자와 수신자 양쪽에 동일한 메시지가 존재하는가?
- [ ] 결재: 기안자와 모든 결재자에게 동일한 문서가 존재하는가?
- [ ] 일정: 모든 참석자에게 동일한 일정이 존재하는가?
- [ ] 사건: assignedTo에 명시된 모든 담당자의 데이터에 해당 사건이 존재하는가?
- [ ] 휴가: 승인된 휴가가 일정으로도 등록되어 있는가?
- [ ] 알림: 대상 부서/전체 대상 알림이 해당 페르소나에게 배포되었는가?

---

## 6. 데이터 작성 가이드 (JSON)

새로운 데이터를 추가할 때 다음 규칙을 준수하십시오.

1. **따옴표**: JSON 표준에 따라 모든 키(Key)와 문자열 값(Value)은 반드시 **큰따옴표(`"`)**로 감싸야 합니다.
2. **날짜 포맷**: `YYYY-MM-DDTHH:mm:ss` 형식의 문자열을 사용하십시오.
   - 예: `"2025-12-31T14:30:00"`
3. **불리언**: `true`, `false` (따옴표 없음)
4. **마지막 쉼표**: 배열이나 객체의 마지막 항목 뒤에는 쉼표(`,`)를 붙이지 마십시오.

### 예시 (incidents.json)
```json
[
  {
    "id": "inc-new-001",
    "caseNumber": "20260101-001",
    "dangerLevel": "파형",
    "status": "접수",
    "reportContent": "신규 발생한 시간 왜곡 현상",
    "requiresPatrol": true,
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-01T10:00:00"
  }
]
```

## 7. 데이터 템플릿 및 상속 (Data Templates & Inheritance)

빌드 시점에 동적으로 데이터를 생성하는 시스템(v1.4, 2026-01-02 업데이트)에 대한 명세입니다.

### 7.1 개요
- **소스 위치**: `data-templates/`
- **목적**: 중복되는 데이터를 `_base` 템플릿으로 관리하여 유지보수 효율성 증대
- **작동 시점**: `npm run dev` 또는 `npm run build` 실행 시

### 7.2 폴더 구조
```
data-templates/
├── global/          # 전사 공통 원본
├── ordinary/        # 일반 요원 원본
└── personas/
    ├── _base/       # [NEW] 페르소나 공통 데이터 (부모)
    │   ├── schedules.json
    │   └── ...
    ├── choiyowon/   # 개별 페르소나 데이터 (자식)
    │   └── schedules.json
    └── ...
```

### 7.3 상속 로직 (Inheritance Rules)
스크립트(`scripts/generateDynamicData.cjs`)는 다음과 같은 로직으로 데이터를 병합하여 최종 `src/data`를 생성합니다.

1. **매칭**: `personas/{name}/{file}.json` 처리 시, `personas/_base/{file}.json` 존재 여부 확인
2. **병합 (Merge)**:
   - **배열(Array)**: `_base` 배열 항목 뒤에 `specific` 배열 항목 추가 (Base 1, 2, 3 + Specific 4, 5)
   - **객체(Object)**: `_base` 속성을 `specific` 속성이 덮어씀 (Override)
3. **날짜 규칙 적용**: `fixed:MM-DD`, `relative:+3d` 등의 규칙을 실제 날짜로 변환

### 7.4 작성 예시
**data-templates/personas/_base/schedules.json** (공통):
```json
[{"title": "신년 행사", "date": "fixed:01-02"}]
```

**data-templates/personas/choiyowon/schedules.json** (개별):
```json
[{"title": "개인 휴가", "date": "fixed:01-10"}]
```

**결과 (src/data/personas/choiyowon/schedules.json)**:
```json
[
  {"title": "신년 행사", "date": "2025-01-02..."},
  {"title": "개인 휴가", "date": "2025-01-10..."}
]
```

---

## 9. 부서 표시명 (Department Display Names) 

데이터에서 부서를 표시할 때 사용하는 명칭입니다 (v1.5, 2026-01-02 업데이트).

| 코드 키 | 표시명 | 설명 |
|---------|--------|------|
| `baekho` | 신규조사반 | 신규 재난 조사 및 분류 담당 |
| `hyunmu` | 출동구조반 | 현장 출동 및 인명 구조 담당 |
| `jujak` | 현장정리반 | 봉인/정화 및 사후 처리 담당 |

> **주의**: 팀 번호와 함께 표시할 때는 공백을 넣어서 `출동구조반 1팀` 형식으로 표기합니다.  
> ❌ `출동구조반팀` (잘못된 표기)

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.5 | 2026-01-02 | 부서 표시명 변경 (백호→신규조사반, 현무→출동구조반, 주작→현장정리반) |
| v1.4 | 2026-01-02 | 데이터 검증 시스템 추가 (`scripts/validateData.cjs`) |
| v1.3 | 2026-01-02 | 데이터 템플릿 상속 시스템 추가 (`_base/` 디렉토리) |
| v1.0 | 2026-01-01 | TS → JSON 마이그레이션, DataManager 도입 |

