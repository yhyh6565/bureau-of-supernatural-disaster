# 초자연재난관리국 인트라넷 시스템 "해태" - Validation Scripts

이 폴더에는 코드베이스의 품질을 검증하는 2가지 전문 에이전트가 포함되어 있습니다:

1. **Alignment Validator**: 기획안 및 원작 설정 준수 검증
2. **UX/UI Validator**: 사용자 경험 및 반응형 디자인 검증

## validateAlignment.ts

코드베이스가 `specification.md`, `DATA_SPECIFICATION.md`, 그리고 `research/RESEARCH_초자연재난관리국.md`와 일치하는지 체계적으로 검증하는 도구입니다.

### 실행 방법

```bash
npm run validate
```

### 검증 항목

#### 1. 타입 정의 검증 (`src/types/haetae.ts`)
- 부서 타입 (Department): `baekho`, `hyunmu`, `jujak` 3개 부서
- 재난 등급 (DangerLevel): 형刑 시스템 (`멸형`, `파형`, `뇌형`, `고형`)
- 재난 상태 (IncidentStatus): 워크플로우 상태 7단계
- 요원 상태 (AgentStatus): `정상`, `부상`, `오염`, `실종`, `사망`

#### 2. 상수 정의 검증 (`src/constants/haetae.tsx`)
- DEPARTMENT_INFO: 부서별 표시 정보 (이름, 정식 명칭, 색상, 아이콘)
- 부서 아이콘: 커스텀 SVG 컴포넌트 import (`BaekhoIcon`, `HyunmuIcon`, `JujakIcon`)
- lucide-react 아이콘: 일반 아이콘 사용 확인
- FUNERAL_OPTIONS: 장례법 선택지 5가지

#### 3. 데이터 아키텍처 검증 (`src/data/`)
- **3계층 구조**:
  - `global/`: 전사 공통 데이터 (incidents, notifications, equipment, locations)
  - `ordinary/`: 일반 요원 데이터 (messages, approvals, schedules, incidents)
  - `personas/`: 7명 페르소나별 데이터 (각 5개 파일)
- **페르소나 목록**: 박홍림, 최요원, 류재관, 김솔음, 해금, 고영은, 장허운
- **DataManager**: 병합 로직 메서드 확인 (getIncidents, getNotifications, etc.)

#### 4. UI 컴포넌트 검증
- 부서 아이콘 (`src/components/icons/DeptIcons.tsx`): Heavy/Solid 스타일 SVG
- 이모티콘 사용 금지: 주요 컴포넌트에서 이모티콘 사용 여부 확인
- specification.md의 "이모티콘 사용 금지" 정책 준수

#### 5. 페이지 구조 검증 (`src/pages/`)
- GNB 7대 메뉴:
  - Dashboard (메인)
  - MyPage (개인정보)
  - NoticesPage (공지사항)
  - MessagesPage (쪽지함)
  - ApprovalsPage (결재)
  - TasksPage (담당업무)
  - ResourcesPage (장비/서비스 + 방문 신청 통합) 또는 EquipmentPage + VisitsPage (분리)

#### 6. 원작 설정 준수 검증
- **장비 데이터** (`src/data/global/equipment.json`):
  - 은심장, 도깨비불, 악의 저울, 간이 유리감옥
  - 해태상, 줄잡이, 신발끈
  - 도깨비 초롱, 도깨비 감투, 유리 손포
- **방문 장소** (`src/data/global/locations.json`):
  - 도깨비 공방, 바리데기 세공소
  - 이정 책방, 용천 선녀탕

### 출력 예시

검증이 성공하면 다음과 같이 출력됩니다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  초자연재난관리국 인트라넷 시스템 "해태" - Alignment Validator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] 타입 정의 검증
✓ 타입 정의 검증 완료

[2] 상수 정의 검증
✓ 상수 정의 검증 완료

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
검증 결과 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

요약:
  오류 (Error):   0건
  경고 (Warning): 0건
  정보 (Info):    0건

✓ 모든 검증을 통과했습니다!
코드베이스가 specification.md, data_specification.md, 그리고 원작 리서치 자료와 잘 align되어 있습니다.
```

검증 실패 시에는 카테고리별로 상세한 이슈 정보가 출력됩니다:

```
[Type Definition]
  1. [오류] 부서 타입에 'baekho'가 정의되어 있지 않습니다
     위치: src/types/haetae.ts
     제안: Department 타입에 'baekho'를 추가하세요

[Data Architecture]
  1. [오류] 페르소나 폴더가 없습니다: choiyowon
     위치: src/data/personas/choiyowon

  2. [경고] DataManager에 페르소나 이름이 없습니다: 최요원
     위치: src/data/dataManager.ts
     제안: specification.md의 페르소나 목록을 확인하세요
```

### 심각도 수준

- **오류 (Error)**: 반드시 수정해야 하는 문제. specification과 일치하지 않음
- **경고 (Warning)**: 권장사항 위반. 동작에는 문제없지만 spec 정책과 다름
- **정보 (Info)**: 참고 정보. 원작에 등장하지만 현재 구현되지 않은 항목

## 개발 워크플로우

1. **코드 작성 후 검증**
   ```bash
   npm run validate
   ```

2. **이슈 확인 및 수정**
   - 오류(Error)는 반드시 수정
   - 경고(Warning)는 가능한 한 수정 권장
   - 정보(Info)는 향후 구현 계획 참고

3. **재검증**
   ```bash
   npm run validate
   ```

4. **모든 검증 통과 확인**

## 참고 문서

- `specification.md`: 시스템 기획안 (v1.2)
- `DATA_SPECIFICATION.md`: 데이터 구조 및 관리 규칙
- `research/RESEARCH_초자연재난관리국.md`: 원작 리서치 자료

---

## validateUXDesign.ts

베테랑 프런트엔드 디자이너 관점에서 PC와 모바일 디자인의 최적성을 검증하는 도구입니다.

### 실행 방법

```bash
npm run validate:ux
```

### 검증 항목

#### 1. 📱 반응형 디자인 (Responsive Design)
- **Breakpoint 사용**: sm:, md:, lg: 반응형 클래스 적용 여부
- **Grid 반응형**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 패턴
- **Flex 방향**: `flex-col md:flex-row` 모바일 대응
- **Hidden 처리**: `hidden md:block` 디바이스별 표시/숨김

#### 2. 📜 스크롤 최적화 (Scroll Optimization)
- **모바일**: 1.5 화면(667px) 이상이면 경고, 3 화면 이상이면 주요 이슈
- **데스크탑**: 2 화면(2160px) 이상이면 공간 활용 미흡
- **해결책**: Accordion, Tabs, Grid 레이아웃 활용 제안

#### 3. 🖥️ 뷰포트 활용 (Viewport Utilization)
- **Max-width**: 대시보드에 좁은 max-width 사용 시 경고
- **Container**: 중첩 container 감지
- **공간 낭비**: 데스크탑에서 양쪽 여백 과다

#### 4. 📊 정보 계층 구조 (Information Hierarchy)
- **H1 태그**: 페이지당 1개만 권장
- **헤딩 구조**: H1 없이 H2 시작 시 경고
- **텍스트 크기**: text-xs/sm 과다 사용(70% 이상) 시 가독성 경고

#### 5. 👆 인터랙션 요소 (Interaction Elements)
- **버튼 크기**: 모바일 터치 타겟 최소 44x44px
- **아이콘 버튼**: aria-label 필수
- **링크 구분**: 색상 또는 밑줄로 일반 텍스트와 구분

#### 6. ♿ 접근성 (Accessibility)
- **aria-label**: 아이콘 버튼에 설명 추가
- **링크 스타일**: 클릭 가능 요소 명확성
- **Hover 상태**: 인터랙션 피드백

#### 7. 📐 공간 활용 (Space Utilization)
- **Padding**: 모바일에서 과도한 padding(p-12 이상) 경고
- **Gap**: Grid/Flex에 gap 미설정 시 제안
- **균일성**: 대시보드 카드 높이 일관성

### 디바이스별 뷰포트 기준

```typescript
Mobile:   375 x 667  (iPhone SE)
Tablet:   768 x 1024 (iPad)
Desktop: 1920 x 1080 (1080p)
```

### 심각도 수준

- **심각 (Critical)**: 반드시 즉시 수정. 특정 디바이스에서 사용 불가
  - 예: 반응형 디자인 미적용, 모바일 테이블 미대응

- **주요 (Major)**: 빠른 수정 권장. 사용성 크게 저하
  - 예: Grid 반응형 미적용, 터치 타겟 크기 부족

- **경미 (Minor)**: 점진적 개선. UX 품질 향상
  - 예: 헤딩 구조 문제, 작은 텍스트 과다

- **제안 (Suggestion)**: 선택적 개선. Best Practice
  - 예: gap 추가, 카드 높이 균일화

### 출력 예시

검증 결과는 다음과 같이 출력됩니다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       베테랑 프런트엔드 디자이너 - UX/UI Validator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] 페이지 UX/UI 분석
  분석 중: Dashboard
  분석 중: MyPage
  ...

[2] 주요 컴포넌트 분석
✓ 컴포넌트 분석 완료 (7개)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UX/UI 검증 결과 리포트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

심각도별 요약:
  심각 (Critical):    8건
  주요 (Major):       7건
  경미 (Minor):       9건
  제안 (Suggestion):  1건

디바이스별 요약:
  📱 모바일 관련:  24건
  💻 데스크탑 관련: 15건

카테고리별 상세 이슈:

📱 반응형 디자인 (17건)

  1. [심각] 🌐 ApprovalsPage
     문제: 반응형 디자인이 적용되지 않았습니다
     영향: PC와 모바일에서 동일한 레이아웃이 사용되어 각 디바이스에 최적화되지 않았습니다.
     해결: Tailwind의 sm:, md:, lg: breakpoint를 사용하여 디바이스별 최적화를 적용하세요.
     위치: ApprovalsPage
```

### 특화 분석

#### 대시보드 페이지 (Dashboard)
- Grid/Flex 레이아웃 필수 검증
- 카드 높이 균일성 체크
- 섹션 과다 시 Tabs 제안

#### 테이블 (Table)
- 모바일 overflow-x-auto 필수
- 컬럼 6개 이상 시 모바일 최적화 경고
- 카드 레이아웃 전환 제안

### 개발 워크플로우

**UX/UI 최적화 프로세스:**

1. **컴포넌트/페이지 개발 후 검증**
   ```bash
   npm run validate:ux
   ```

2. **이슈 우선순위 확인**
   - Critical: 즉시 수정 (모바일/데스크탑 브레이크)
   - Major: 당일 수정 (사용성 저하)
   - Minor: 주간 수정 (UX 품질)
   - Suggestion: 점진적 개선

3. **디바이스별 테스트**
   - Chrome DevTools: 375px (모바일), 768px (태블릿), 1920px (데스크탑)
   - 실제 디바이스 테스트 권장

4. **재검증 및 반복**
   ```bash
   npm run validate:ux
   ```

### 베스트 프랙티스 체크리스트

#### ✅ 반응형 필수 패턴

```tsx
// Grid 레이아웃
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flex 방향
<div className="flex flex-col md:flex-row gap-4">

// 텍스트 크기
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Padding 조절
<div className="p-4 md:p-6 lg:p-8">

// 조건부 표시
<div className="hidden md:block">데스크탑 전용</div>
<div className="block md:hidden">모바일 전용</div>
```

#### ✅ 터치 타겟 크기

```tsx
// 버튼 최소 크기 (44x44px)
<Button size="default" className="p-3">클릭</Button>

// 아이콘 버튼 aria-label
<Button aria-label="메뉴 열기">
  <MenuIcon />
</Button>
```

#### ✅ 스크롤 최적화

```tsx
// 긴 콘텐츠 -> Tabs
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">섹션 1</TabsTrigger>
    <TabsTrigger value="tab2">섹션 2</TabsTrigger>
  </TabsList>
</Tabs>

// 긴 리스트 -> Accordion
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>접기/펼치기</AccordionTrigger>
    <AccordionContent>내용</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 통합 검증 워크플로우

**배포 전 체크리스트:**

```bash
# 1. Specification 준수 검증
npm run validate

# 2. UX/UI 디자인 검증
npm run validate:ux

# 3. TypeScript 빌드
npm run build

# 4. Lint 검사
npm run lint
```

모든 검증을 통과해야 production 배포 가능합니다.

---

**버전**: v1.1
**작성일**: 2026-01-01
**작성자**: Alignment & UX/UI Validation Agents
