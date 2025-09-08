# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

가족끼리 사진과 일정을 공유하는 홈페이지 프로젝트입니다. 현재 기획 단계로 상세한 문서들이 준비되어 있습니다.

## 아키텍처

**Frontend**: React (Vite + TypeScript), Tailwind CSS
**Backend**: FastAPI (Python 3.11), REST API
**Database**: SQLite (개발용), PostgreSQL (운영용)
**Storage**: `/data/photos/` 로컬 파일 저장, UUID 기반 파일명
**배포**: Docker Compose + Nginx 리버스 프록시, Let's Encrypt HTTPS

### 주요 API 엔드포인트 (계획)
- `/api/photos` - 사진 업로드/조회
- `/api/events` - 일정 관리

### 데이터베이스 스키마 (계획)
- `photos` 테이블: (id, filename, uploaded_at)
- `events` 테이블: (id, title, date, description)

## 개발 단계

4단계 개발 계획:

1. **Phase 1**: 목업 MVP (가짜 데이터 + UI/라우팅)
2. **Phase 2**: 실제 DB/API 연동
3. **Phase 3**: Docker 운영 환경 구성
4. **Phase 4**: 고급 기능 (앨범, 수정/삭제)

## MVP 기능

- 사진 업로드 및 보기 (단일 파일, 썸네일 갤러리)
- 달력 기반 일정 관리
- 모바일/PC 반응형 디자인
- 인증 없음 (가족 전용 접근 가정)

## 개발 환경 설정
개발 명령어(초안):
- 프론트엔드: `npm run dev` (Vite 개발 서버)
- 백엔드/DB (Docker dev): `docker compose -f docker-compose.dev.yml up --build`
- - 운영 배포(예정): `docker-compose -f docker-compose.prod.yml up -d` (추후 작성)

## 프로젝트 구조

- `/docs/` - 기획 문서들 (PRD, MVP 명세, 실행계획)
- 향후 `/frontend/`, `/backend/`, `/docker/` 디렉터리 예상

## 주요 제약사항

- 한국어 인터페이스
- 가족 중심의 단순 인증 모델
- 모바일 우선 반응형 디자인 필수
- 로컬 사진 저장 (클라우드 미사용)