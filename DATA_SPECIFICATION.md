# 🗄️ 해태 시스템 데이터 명세서 (Data Specification v1.0)

본 문서는 초자연재난관리국 인트라넷 시스템 '해태'의 데이터 구조, 저장 방식, 관리 규칙을 정의한 통합 명세서입니다.

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
│   └── locations.json
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
    caseNumber: string;         // 내부 관리 번호 "20251231-001"
    dangerLevel: DangerLevel;   // "멸형" | "파형" | "뇌형" | "고형"
    status: IncidentStatus;     // "접수" -> "조사중" -> "구조대기" ... -> "종결"
    reportContent: string;      // 제보 내용
    requiresPatrol: boolean;    // 정기 순찰 필요 여부
    countermeasure?: string;    // [특수] 파훼법 (조사 완료 시)
    entryRestrictions?: string; // [특수] 진입 제한 사항
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
    createdBy: string;   // 기안자 ID (Agent ID)
    approver: string;    // 결재자 ID
    content: string;     // 본문
    // ...
  }
  ```

### 3.3 💌 쪽지 (Message)
사내 메신저 데이터입니다.

- **JSON 파일**: `ordinary/messages.json`, `personas/*/messages.json`
- **주요 필드**:
  ```typescript
  interface Message {
    id: string;
    senderId: string;    // 발신자 ID
    receiverId: string;  // 수신자 ID ("me" 사용 시 현재 로그인한 유저로 간주 가능)
    title: string;
    content: string;
    isRead: boolean;
    // ...
  }
  ```

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

---

## 4. 상수 및 설정값 (Constants)

코드 내 하드코딩을 방지하기 위해 **`src/constants/haetae.ts`**에서 관리합니다.

### 장례 방식 (FUNERAL_OPTIONS)
요원 사망 시 처리 절차에 대한 선택지입니다.
- 화장, 매장, 수목장
- 데이터 소각 (기록 말소)
- 기억 소거 후 방생

---

## 5. 데이터 작성 가이드 (JSON)

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
