# /feature-breakdown is running… 우리집 홈페이지 초기 개발 환경 세팅 (Patched for Docker + Postgres)

> 본 문서는 기존 초안의 **SQLite 전제**를 **Postgres (Docker 컨테이너)** 로 정정하고, 현재 실제 환경(프론트 로컬, 백엔드/DB 도커)과 일치하도록 업데이트했습니다.

---

## ● 문제 분석

### 1) 문제 정의 및 복잡성 평가

* **문제**: 우리집 홈페이지 초기 개발 환경 세팅
* **복잡성 수준**: 중간
* **예상 소요 시간**: 4–6시간
* **주요 도전 과제**:

  * Frontend(React+Vite) + Backend(FastAPI) **이기종 실행 모델**(로컬 vs 컨테이너)
  * 한국어 폰트 및 모바일 최적화 설정
  * **도커 볼륨 기반 로컬 파일 저장소** 설계(`/data/photos`)

### 2) 범위 및 제약조건

* **포함 범위**:

  * Frontend 개발환경 (Vite + React + TypeScript)
  * Backend 개발환경 (FastAPI + Python 3.11)
  * **Docker 기반 DB(PostgreSQL) & 볼륨(/data/photos)**
  * 개발 서버 실행 스크립트/Makefile
* **제외 범위**:

  * 운영 배포 인프라 전부(도메인/HTTPS/모니터링) → **Phase 3에서 Nginx 기반 배포로 예정**
  * 인증/권한 등 고급 기능 → 이후 Phase에서 확장
* **정정된 제약조건**:

  * **DB = PostgreSQL (Docker 컨테이너) 사용** *(개발/운영 동일 스택)*
  * 기존 `/docs/` 디렉터리 유지
  * `CLAUDE.md` 지침 준수
* **전제조건**:

  * Node.js 18+
  * Docker Desktop + WSL2 Integration (Windows)
  * Git, Make(선택)

---

## 작업 분해

### Phase 1: 프로젝트 구조 및 기본 실행

| 작업           | 설명                                                              | 완료 기준 (DoD)                      | 우선순위 |
| ------------ | --------------------------------------------------------------- | -------------------------------- | ---- |
| 디렉터리 구조 생성   | `/frontend/`, `/backend/`, `docker-compose.dev.yml`, `Makefile` | 폴더/파일 생성 완료                      | 높음   |
| Frontend 초기화 | `npm create vite@latest frontend -- --template react-ts`        | `npm run dev` 동작                 | 높음   |
| Backend 초기화  | FastAPI 앱, CORS 설정, `/api/health`                               | `uvicorn` 기동 & `/api/health` 200 | 높음   |
| DB 컨테이너      | Postgres 컨테이너 + `.env.dev` 연결                                   | 컨테이너 기동, 연결 문자열 유효               | 높음   |
| 파일 저장 볼륨     | `/data/photos` 볼륨 마운트                                           | 볼륨 생성 및 쓰기 가능                    | 높음   |

### Phase 2: 개발 도구/품질 설정

| 작업              | 설명                      | 완료 기준 (DoD)               | 의존성        |
| --------------- | ----------------------- | ------------------------- | ---------- |
| Tailwind CSS    | 한국어 폰트(Noto Sans KR) 포함 | 폰트/기본 스타일 반영              | Frontend   |
| ESLint/Prettier | 린트/포맷 통일                | `npm run lint` 통과         | Frontend   |
| Alembic 초기화     | DB 마이그레이션 파이프라인         | `alembic upgrade head` 성공 | Backend/DB |
| dotenv & 설정     | `.env.dev`/CORS/포트      | 프론트↔백엔드 통신 OK             | Backend    |

### Phase 3: 스크립트/문서화/배포 준비

| 작업         | 설명                                                                  | 완료 기준 (DoD)     | 위험도 |
| ---------- | ------------------------------------------------------------------- | --------------- | --- |
| 개발 실행 스크립트 | `make up/down/logs` 등                                               | 로컬/WSL에서 안정 동작  | 낮음  |
| 문서화 업데이트   | `docs/prd.md`, `docs/mvp.md`, `docs/execution_plan.md`, `CLAUDE.md` | 최신 상태 반영        | 낮음  |
| (초기) 배포 러프 | Nginx 리버스 프록시 스케치                                                   | prod compose 초안 | 중간  |

---

## 산출물

* 프론트/백엔드 **개발 환경 완비**
* **Postgres (Docker) + Alembic** 기반 DB 파이프라인
* `/data/photos` 볼륨 저장 구조
* 실행 스크립트/Makefile
* 최신화된 문서(PRD, MVP, 실행계획, CLAUDE)

---

## 실행 계획

### 우선순위 매트릭스

* **긴급 & 중요**: 프로젝트 구조, Frontend/Backend 초기화, Postgres 컨테이너, Health 확인
* **중요하지만 덜 긴급**: ESLint/Prettier, Tailwind, Alembic
* **긴급하지만 덜 중요**: 개발 스크립트 보강
* **덜 중요 & 덜 긴급**: 문서 미세정리

### 마일스톤

* **1–2시간**: Phase 1 완료(기본 구조/컨테이너/헬스체크)
* **3–4시간**: Phase 2 완료(Tailwind/ESLint/Alembic)
* **4–6시간**: Phase 3 일부(스크립트/문서), Nginx 배포 초안

### 위험 요소 및 대응

| 위험                    | 가능성 | 영향 | 대응                                                 |
| --------------------- | --- | -- | -------------------------------------------------- |
| 포트 충돌(5173/8000/5432) | 중   | 중  | compose 포트 재매핑, `.env`에 노출                         |
| 패키지 빌드 실패             | 중   | 중  | `psycopg[binary]` 사용, 버전 고정, `--no-cache` 빌드       |
| CORS 오류               | 중   | 중  | `.env.dev`의 `CORS_ORIGINS` 정확히 지정 후 재기동            |
| 윈도우 권한/WSL 이슈         | 중   | 중  | Docker Desktop WSL Integration, 방화벽 **Private** 허용 |

---

## 품질 체크리스트 (QA)

* [ ] `make up` 후 `http://localhost:8000/api/health` 200
* [ ] `http://localhost:8000/docs` 접속 가능
* [ ] 프론트 `npm run dev` → API 호출 성공(CORS OK)
* [ ] `alembic init` → `revision --autogenerate` → `upgrade head` 동작
* [ ] Tailwind + Noto Sans KR 적용 확인
* [ ] ESLint/Prettier 통과

**전체 완료 기준**

* 프론트/백엔드 동시 개발 가능, API 호출/응답 OK
* Postgres 연결 및 마이그레이션 파이프라인 동작
* 모바일 반응형 기본 스타일, 한국어 폰트 적용
* CLAUDE.md에 개발 명령/흐름 최신 반영

---

## 리소스

* **도구**: Node.js 18+, Docker Desktop, Python 3.11+
* **라이브러리**: React, Vite, TypeScript, Tailwind CSS, FastAPI, Uvicorn, SQLAlchemy, Alembic, psycopg
* **학습 자료**: Vite / FastAPI / Tailwind 문서 (링크는 로컬 문서에서 관리)

---

## 💡 다음 단계(Claude Code용 오퍼레이터 스텝)

> 아래 절차는 현재 레포 기준으로 **바로 수행** 가능한 명령과 산출물을 제시합니다.

1. **DB/Alembic 세팅**

   * `backend`에 Alembic 초기화: `alembic init migrations`
   * `alembic.ini` 와 `env.py`에서 `DATABASE_URL` (env: `.env.dev`) 로드
   * 최초 모델(Entity) 정의: `User`, `Photo`, `Event` (스키마 스텁)
   * `alembic revision --autogenerate -m "init tables"` → `alembic upgrade head`

2. **API 스켈레톤 추가**

   * `GET /api/photos` (리스트), `POST /api/photos` (업로드, 디스크 `/data/photos`에 저장)
   * `GET /api/events` (리스트), `POST /api/events` (생성)
   * CORS: `http://localhost:5173`

3. **프론트 연동**

   * 간단 업로드 폼/리스트 컴포넌트, 캘린더 뷰(라이브러리 선택: FullCalendar 등)
   * `.env` → `VITE_API_URL=http://localhost:8000` 확인

4. **테스트**

   * backend: pytest(헬스/사진 업로드/이벤트 CRUD 최소 happy-path)
   * frontend: vitest 또는 playwright(e2e 헬스/업로드)

5. **문서 반영**

   * `docs/prd.md`, `docs/mvp.md`, `docs/execution_plan.md` 에 위 변경사항 및 명령어 업데이트

---

### 변경 이력

* 2025-09-08: **DB 전제 SQLite → Postgres(Docker)** 로 정정, 현행 스택과 일치하도록 전면 패치
