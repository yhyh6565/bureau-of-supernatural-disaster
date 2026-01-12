# 재관국 데이터 동기화 가이드 (Bureau Sync Guide) - 통합본

재관국 프로젝트의 모든 데이터를 구글 스프레드시트로 관리하기 위한 가이드입니다.
데이터가 많으므로 **`bureau-of-supernatural-disaster/initial_data` 폴더에 생성된 CSV 파일들**을 하나씩 복사해서 붙여넣으시면 됩니다.

## 1. 구글 시트 생성 및 탭(Sheet) 설정

새 구글 스프레드시트를 만들고, 아래 리스트에 있는 탭들을 만들어주세요. (순서 상관 없음)
각 탭에 해당하는 CSV 파일의 내용을 그대로 붙여넣으시면 됩니다.

### A. 전역 데이터 (Global)
관리국 공통 정보입니다.
*   `Global_manuals`: 재난 매뉴얼 DB
*   `Global_incidents`: 발생 재난 목록
*   `Global_equipment`: 전체 장비 목록
*   `Global_locations`: 주요 지역 정보
*   `Global_schedules`: 관리국 전체 일정
*   `Global_notifications`: 전체 공지 알림

### B. 요원 통합 데이터 (Persona Combined)
모든 요원(솔음, 고영은 등 7인)의 데이터를 한곳에 모았습니다.
**`owner_persona`** 열이 요원을 구분하는 핵심이니, 수정하지 마세요!

*   `Persona_messages_All`: 모든 요원의 주고받은 메시지
*   `Persona_approvals_All`: 모든 전자결재 내역 (기안/결재)
*   `Persona_schedules_All`: 요원별 개인 일정
*   `Persona_inspections_All`: 요원별 장비/오염도 점검 기록
*   `Persona_notifications_All`: 개인 알림

### C. 세광지부 데이터 (Segwang)
세광지부 전용 데이터입니다.
*   `Segwang_approvals`: 세광지부 결재 내역
*   `Segwang_inspections`: 세광지부 점검 내역
*   `Segwang_messages`: 세광지부 전용 쪽지
*   `Segwang_schedules`: 세광지부 일정

---

## 2. 웹 게시 (CSV 링크 생성)
1. `파일 > 공유 > 웹에 게시`
2. **각 탭별로** 선택하여 '쉼표로 구분된 값(.csv)' 형식으로 링크 생성.
3. 링크들을 메모장에 잘 복사해두세요.

## 3. 설정 파일 연결 (`sync-config.json`)
`bureau-of-supernatural-disaster/sync-config.json` 파일을 열고 링크를 채워넣으세요.
(형식이 많으니 `sync-config.example.json`을 참고하세요.)

예시:
```json
{
  "global/manuals": "LINK_HERE",
  "global/incidents": "LINK_HERE",
  
  "persona_messages": {
    "url": "LINK_HERE",
    "partitionBy": "owner_persona",
    "targetDir": "src/data/personas/{partition}/messages.json"
  },
  "persona_approvals": {
    "url": "LINK_HERE",
    "partitionBy": "owner_persona",
    "targetDir": "src/data/personas/{partition}/approvals.json"
  },
  
  "segwang/messages": "LINK_HERE"
}
```

## 4. 동기화 실행
```bash
npm run sync
```

## 5. 데이터 추가/수정 방법 (Daily Workflow)
새로운 문서를 추가하거나 요령을 수정하고 싶으신가요?

1. **구글 시트 열기**: 만들어둔 구글 시트에 접속합니다.
2. **행 추가 & 입력**:
   * **전역 데이터**: 해당 탭에 행을 추가하고 입력합니다.
   * **요원 데이터 (Partitioned)**: `Persona_messages_All` 같은 통합 탭에 입력하되, **`owner_persona`** 열에 해당 요원의 ID(예: `solum`)를 정확히 적어주세요. 스크립트가 이 ID를 보고 알아서 해당 요원의 폴더로 배달해줍니다.
3. **동기화**: 터미널에서 다음 명령어를 실행합니다.
   ```bash
   npm run sync
   ```
4. **확인**: 웹사이트를 새로고침하면 내용이 갱신됩니다!

