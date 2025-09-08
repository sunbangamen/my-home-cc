# 🚀 MVP – 우리집 홈페이지 (사진 & 일정 공유)

## 1. 목표
- 가족들이 **가장 빨리 쓸 수 있는 형태**로 사진/일정을 공유할 수 있게 한다.
- 최소 기능만 구현하여 빠른 피드백을 받는다.
- 이후 확장(로그인, 댓글, 알림 등)을 고려하되, 지금은 단순화한다.

---

## 2. 기술 스택 (초안 확정)
### Frontend
- **React (Vite + TypeScript)**
- UI 라이브러리: Tailwind CSS
- 반응형 레이아웃 (모바일/PC 지원)

### Backend
- **FastAPI (Python 3.11)**
- REST API: `/api/photos`, `/api/events`
- CORS 설정 (프론트와 연동)

### Database
- **SQLite (개발)** → 간단히 시작
- **Postgres (운영)** → 확장 고려
- 테이블:
  - `photos (id, filename, uploaded_at)`
  - `events (id, title, date, description)`

### Storage
- `/data/photos/` 폴더에 이미지 저장
- 파일명 충돌 방지를 위해 UUID 사용

### Infra / DevOps
- Docker Compose (backend, db, nginx)
- 프론트: dev = 로컬 Vite, prod = nginx build
- HTTPS 인증서 (Let's Encrypt)

### 보안/품질 가드레일
- 업로드 허용 확장자: jpg/jpeg/png/webp, 최대 10MB
- 서버 저장 시 썸네일 생성(예: 긴 변 1024px), 원본 EXIF 제거(위치정보 보호)
- 컨테이너 볼륨 `/data/photos` 주 1회 증분 백업(로컬→NAS/클라우드)
- 초기 접근 보호: 간단 PIN 페이지(Phase 2에서 정식 Auth로 치환 예정)


---

## 3. MVP 기능 범위
### 사진 공유
- 사진 업로드 (단일 파일)
- 사진 리스트 보기 (썸네일)
- 사진 클릭 시 크게 보기

### 일정 공유
- 달력 보기 (월별)
- 일정 추가 (제목 + 날짜)
- 일정 목록 보기

### 공통
- 홈 화면: “사진 / 일정” 메뉴 진입
- 로그인 없이 접근 가능
- 모바일/PC 대응

---

## 4. 제외 범위 (Not in MVP)
- 회원가입/로그인
- 앨범별 분류
- 일정 알림/푸시
- 댓글/좋아요
- 다중 파일 업로드

---

## 5. 성공 기준 (DoD)
- 사진 1장 이상 업로드 후 볼 수 있다.
- 가족 일정 1건 이상 등록 후 달력에서 확인할 수 있다.
- 모바일에서 사진/일정 화면이 정상 표시된다.
- Docker Compose로 로컬/운영 환경 모두 띄울 수 있다.
