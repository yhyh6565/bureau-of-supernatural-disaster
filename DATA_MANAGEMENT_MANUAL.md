# 📋 데이터 관리 조작 매뉴얼 (Data Management Manual)

이 문서는 "백일몽(Dream Corp Intranet)"과 "초자연재난관리국(Bureau)" 프로젝트의 데이터를 수정하고 관리하는 방법을 설명합니다.

## ⚠️ 핵심 원칙 (Core Principle)

> **"소스 코드(`src/data`)를 직접 수정하지 마세요!"**

모든 데이터는 **`initial_data` 폴더** 내의 **CSV 파일**이 원본(Source of Truth)입니다.
JSON 파일은 이 CSV 파일들로부터 자동으로 생성되는 결과물일 뿐입니다.

---

## 🛠️ 데이터 수정/추가 워크플로우 (Workflow)

데이터를 변경하려면 반드시 다음 **3단계**를 따르세요.

### 1단계: CSV 파일 수정
프로젝트 루트에 있는 `initial_data` 폴더를 열고, 수정하려는 데이터가 담긴 CSV 파일을 엽니다.
(Excel, Numbers, 또는 VS Code 텍스트 에디터 사용 가능)

*   **Dream Corp 경로:** `dreamcorp-intranet/initial_data/...`
*   **Bureau 경로:** `bureau-of-supernatural-disaster/initial_data/...`

### 2단계: 저장 (Save)
내용을 수정하거나 행을 추가한 뒤 파일을 저장합니다.
*   **주의:** 파일 형식이 반드시 `.csv` 여야 합니다. (Excel 저장 시 주의)

### 3단계: 빌드 명령 실행 (Rebuild)
터미널에서 해당 프로젝트 폴더로 이동한 뒤, 아래 명령어를 실행하여 변경 사항을 반영합니다.

```bash
# 데이터 변경 사항 반영 명령어
npm run data:rebuild
```

이 명령어가 실행되면 `initial_data`의 CSV 내용을 읽어 `src/data` 폴더의 JSON 파일들을 싹 지우고 새로 만듭니다.

---

## 📂 프로젝트별 데이터 파일 위치

### 1. 백일몽 인트라넷 (Dream Corp)
| 데이터 종류 | 파일명 (`initial_data/`) | 설명 |
| :--- | :--- | :--- |
| **공지사항** | `notices.csv` | 인트라넷 메인 공지사항 |
| **복지몰 상품** | `products.csv` | 직원 복지몰 판매 상품 목록 |
| **직원 정보** | `users.csv` | 사원 이름, 직급, 소속, 포인트 정보 |
| **쪽지** | `messages.csv` | 받은 편지함/보낸 편지함 데이터 |
| **매뉴얼** | `manuals.csv` | 어둠 관리 매뉴얼 DB |
| **층별 정보** | `floors.csv` | 사옥 층별 안내 정보 |

### 2. 초자연 재난관리국 (Bureau)
| 데이터 종류 | 파일명 (`initial_data/`) | 설명 |
| :--- | :--- | :--- |
| **요원 정보** | `agents.csv` | 전체 요원 목록 및 정보 |
| **재난 상황** | `incidents.csv` | 현재 발생 중인 재난 목록 |
| **전역 장비** | `Global_equipment.csv` | 관리국 공용 장비 목록 |
| **세광지부 쪽지** | `Segwang_messages.csv` | 세광지부 모드 전용 쪽지함 |
| **세광지부 공지** | `Segwang_notices.csv` | 세광지부 모드 전용 공지사항 |
| **요원별 데이터** | `Persona_*.csv` | 특정 요원(솔음, 고영은 등) 전용 데이터 |

---

## 💡 자주 묻는 질문 (FAQ)

**Q. `src/data/users.json`을 직접 고쳤는데 반영이 안 돼요.**
A. `npm run data:rebuild`를 실행하거나 앱을 다시 시작하면, `initial_data/users.csv`의 내용으로 **덮어씌워지기 때문**입니다. 반드시 `initial_data` 안의 CSV를 수정하세요.

**Q. 엑셀에서 수정했는데 글자가 깨져요.**
A. 저장할 때 인코딩이 **UTF-8**인지 확인해주세요. (보통 VS Code에서 직접 수정하면 가장 안전합니다.)

**Q. 새로운 요원을 추가하고 싶어요.**
A. `agents.csv` 파일을 열고 맨 아래에 새 행을 추가한 뒤, `npm run data:rebuild`를 실행하세요.

**Q. 구글 스프레드시트 연동은 어떻게 하나요?**
A. 이건 "고급(Advanced)" 단계입니다. 구글 시트를 사용하도록 설정하려면 별도의 `npm run sync` 설정이 필요합니다. (참고 파일: `SPREADSHEET_SETUP_GUIDE.md`) 현재는 로컬 CSV 방식이 기본입니다.
