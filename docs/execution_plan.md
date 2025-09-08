# 🛠 실행계획 – 우리집 홈페이지 (사진 & 일정 공유)

## Phase 1: Mock MVP (가짜 데이터 기반)
- **목표**: UI/흐름만 빠르게 확인
- **Acceptance Criteria (AC)**
  - 사진 페이지에 목업 이미지가 보인다.
  - 일정 페이지에 목업 일정이 달력에 표시된다.
- **Definition of Done (DoD)**
  - 프론트엔드 라우팅 정상 작동 (홈 → 사진 → 일정).
  - PC/모바일에서 화면 확인 가능.
- **Tasks**
  - [ ] React 기본 페이지 라우팅 구성
  - [ ] 사진/일정 목업 데이터 JSON으로 제공
  - [ ] UI 레이아웃 설계 (TailwindCSS)

---

## Phase 2: Core Infra (실제 데이터 연동: 프론트=로컬, 백엔드/DB=도커)
- **목표**: DB/스토리지와 연결된 기본 기능 완성
- **AC**
  - 사진 업로드 API를 통해 파일이 저장된다.
  - 일정 등록 API를 통해 DB에 일정이 저장된다.
  - 프론트엔드에서 업로드/등록 결과를 확인할 수 있다.
- **DoD**
  - FastAPI API 동작 확인 (pytest)
  - DB 테이블 정상 생성 및 마이그레이션 가능
  - 업로드된 파일이 `/data/photos/`에 저장됨
- **Tasks**
  - [ ] FastAPI 프로젝트 구조 세팅 (Docker 컨테이너)
  - [ ] `/api/photos` 업로드/조회 API 작성 (컨테이너 내 /data/photos 볼륨 사용)
  - [ ] `/api/events` 일정 등록/조회 API 작성 (Postgres 컨테이너 사용)
  - [ ] DB 마이그레이션 초안 (alembic 초기화)
  - [ ] React에서 fetch 연동: **VITE_API_BASE=http://localhost:8000** 사용 (프론트는 로컬 dev 서버)

---

## Phase 3: 운영 안정화
- **목표**: 운영 환경에서도 안정적으로 동작
- **AC**
  - Docker Compose로 dev/prod 환경 구분 가능
  - Nginx 리버스 프록시 정상 동작
- **DoD**
  - `docker-compose up` 시 전체 서비스 구동
  - 프론트 dev = Vite, prod = Nginx build
  - HTTPS 인증 적용 (Let's Encrypt)
- **Tasks**
  - [ ] Dockerfile & docker-compose.dev.yml 작성
  - [ ] docker-compose.prod.yml 작성
  - [ ] Nginx 리버스 프록시 설정
  - [ ] HTTPS 인증서 자동 발급 스크립트

---

## Phase 4: 고도화
- **목표**: 사용자 편의 기능 추가
- **AC**
  - 사진 앨범별 분류 가능
  - 일정 수정/삭제 가능
- **DoD**
  - 기존 데이터와 호환 유지
  - 테스트 케이스 90% 이상 통과
- **Tasks**
  - [ ] 사진 앨범 기능 추가
  - [ ] 일정 수정/삭제 API 추가
  - [ ] UI/UX 개선
