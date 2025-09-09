# GitHub Issue Analysis & Solution Planning - Issue #5 (최종 지시안)

**문서 작성일**: 2025-09-09  
**이슈 번호**: #5  
**작성자**: Claude Code  
**상태**: Implementation Ready

---

## 📋 Issue Overview

### Issue Information Summary
**이슈 번호**: #5  
**제목**: [Feature] Phase 2: Core Infra - DB/스토리지 연동 기반 기능 구현  
**상태**: OPEN  
**생성일**: 2025-09-09T04:12:58Z  
**담당자**: (미지정)  
**라벨**: (없음)  
**마일스톤**: (없음)  

### 핵심 요구사항
- 사진 업로드 API를 통해 파일이 `/data/photos/`에 저장된다
- 일정 등록 API를 통해 PostgreSQL DB에 일정이 저장된다  
- 프론트엔드에서 업로드/등록 결과를 확인할 수 있다
- FastAPI + PostgreSQL + Docker Compose 기반 Core Infra 구축

### 기술적 제약사항
- FastAPI (Python 3.11+), PostgreSQL, SQLAlchemy + asyncpg
- Alembic 마이그레이션 시스템
- 프론트엔드는 로컬 dev 서버 유지 (VITE_API_BASE=http://localhost:8000)
- 백엔드/DB는 Docker 컨테이너로 실행

---

## 🗄️ DB Schema Draft

### photos
- `id` (PK, int, auto)
- `filename` (str, UUID 기반 파일명)
- `uploaded_at` (datetime, default now)

### events  
- `id` (PK, int, auto)
- `title` (str, not null)
- `date` (date, not null)
- `description` (str, optional)
- `created_at` (datetime, default now)

---

## 🔄 Mock → DB Migration Strategy

**Phase 1에서 사용한 photos.json, events.json 데이터를 DB로 이행**

### 절차:
1. Alembic 초기화 및 위 스키마 기반 마이그레이션 생성
2. 기존 목업 JSON을 변환하는 seed 스크립트 작성 (`seed_data.py`)
3. `alembic upgrade head && python seed_data.py` 실행으로 DB 채움
4. 프론트엔드 fetch 대상을 Mock JSON → API 호출로 교체

---

## 🎯 Solution Strategy

### Recommended Approach
**Option 3: MVP 우선 + 점진적 개선**
- 빠른 검증으로 이후 Phase에 대한 신뢰도 확보
- 핵심 요구사항(API 동작 확인)에 집중

---

## 📅 Detailed Implementation Plan

### Phase 2.1: Database & Environment Setup (Day 1)
- Alembic 초기 마이그레이션 생성
- `docker-compose.dev.yml` 테스트
- `.env.dev` 환경변수 구성

### Phase 2.2: API 검증 & 문서화 (Day 2)
- Photos/Events API pytest 케이스 작성
- `/data/photos` 파일 저장 검증
- FastAPI Swagger UI 확인

### Phase 2.3: Frontend Integration (Day 3-4)
- `frontend/src/api/client.ts` 생성, axios 기반 API 호출
- `Photos.tsx`: mock 제거 → `/api/photos` 연동
- `Events.tsx`: mock 제거 → `/api/events` CRUD 연동
- 로딩/에러 상태 UI 구현

### Phase 2.4: 통합 테스트 & 검증 (Day 5)
- 사진 업로드 → 저장 → 표시 E2E 테스트
- 일정 CRUD → 캘린더 표시 테스트
- 대용량(10MB) 업로드 테스트
- 주요 브라우저 호환성 확인

---

## ⚠️ Risk Assessment & Mitigation

- **Docker 네트워킹 문제** → 단계별 docker-compose 테스트
- **CORS 설정 오류** → FastAPI CORS 미들웨어 선제 적용
- **DB 마이그레이션 충돌** → 깨끗한 DB 환경에서 작업
- **파일 권한 문제** → `/data/photos` 권한 확인

---

## 🧪 Quality Assurance Plan

### Test Strategy
- **Unit Tests**: pytest로 Photos/Events 엔드포인트 테스트
- **Integration Tests**: DB 연동 및 파일 저장 검증
- **E2E Tests**: 프론트-백엔드 전체 흐름 검증

### 성능 기준:
- API 응답 < 2초
- 파일 업로드(10MB) < 10초  
- 컨테이너 메모리 사용 < 512MB

### 코드 품질:
- 테스트 커버리지 80% 이상
- TypeScript 오류 0
- OpenAPI 스키마 완성

---

## 📢 Communication Plan

- 매일 GitHub Issue 댓글로 EOD 업데이트
- Phase 단위 완료 시 체크리스트 갱신
- 문제 발생 시 즉시 이슈 댓글에 상황 공유

---

## 🎯 Success Criteria

- [ ] 사진 업로드 → `/data/photos` 저장 → 프론트 표시 전체 플로우 완료
- [ ] 일정 등록 → PostgreSQL 저장 → 캘린더 표시 전체 플로우 완료
- [ ] `docker-compose -f docker-compose.dev.yml up --build` 실행 시 전체 환경 정상 기동
- [ ] pytest 전부 통과, 프론트 dev 서버 연동 확인

---

**문서 버전**: v1.1 (DB 스키마 + Mock→DB 이행 전략 추가)  
**업데이트일**: 2025-09-09