# GitHub Issue #7 분석 및 해결 계획 (보완 통합본)

**이슈 번호**: #7
**제목**: \[Feature] Phase 3 운영 안정화: Docker Compose + Nginx + HTTPS 자동화
**상태**: OPEN
**생성일**: 2025-09-09T07:30:53Z
**분석일**: 2025-09-09

---

## 📋 Issue Analysis & Solution Planning

### Issue Information Summary

* **문제 유형**: Infrastructure Enhancement
* **우선순위**: High
* **복잡도**: Complex
* **예상 완료일**: 2025-09-30

### 핵심 요구사항

* [x] Docker Compose로 dev/prod 환경 구분 가능
* [x] Nginx 리버스 프록시 정상 동작
* [x] `docker-compose up` 시 전체 서비스 구동
* [x] 프론트 dev = Vite, prod = Nginx build
* [x] HTTPS 인증 적용 (Let's Encrypt)

### 기술적 제약사항

* 기존 Phase 2 완료 상태 기반 구축 필요
* PostgreSQL + FastAPI + React 스택 유지
* `/data/photos/` 로컬 파일 저장소 영속성 보장
* 모바일/PC 접근 정상 동작 필요

---

## 🔍 Technical Investigation Results

### 현재 프로젝트 상태

* **Frontend**: React (Vite + TypeScript), Tailwind CSS ✅
* **Backend**: FastAPI, 기본 Dockerfile.dev 존재 ✅
* **Database**: PostgreSQL, docker-compose.dev.yml 구성 완료 ✅
* **개발 환경**: Makefile로 개발 명령어 체계화 ✅

### 영향 범위 분석

* **Frontend**: production Dockerfile 및 Nginx 설정 필요
* **Backend**: production Dockerfile 및 환경변수 분리 필요
* **Database**: dev/prod 환경 분리 및 볼륨 매핑 최적화
* **Infrastructure**: Nginx, Certbot 컨테이너 추가 및 네트워킹 설정

### 의존성 체크

* **Depends on**: Phase 2 완료 (현재 완료 상태 ✅)
* **Blocks**: Phase 4 고도화 작업
* **Related to**: 전체 아키텍처 문서 (docs/execution\_plan.md)

---

## 🎯 Solution Strategy

### 접근법 비교 분석

| 접근법       | 장점                  | 단점            | 예상시간     | 위험도        |
| --------- | ------------------- | ------------- | -------- | ---------- |
| 점진적 구축    | 단계별 검증, 위험 분산       | 구현 시간 길어짐     | 3-4주     | Low        |
| 전면 재구축    | 일관성, 최적화, 빠른 완료     | 높은 초기 위험      | 1-2주     | High       |
| **하이브리드** | **기존 유지 + prod 추가** | **환경별 설정 차이** | **2-3주** | **Medium** |

### 선택한 접근법

**하이브리드 접근법** 선택
**선택 이유**:

* 현재 dev 환경이 안정적으로 동작 중
* Phase 2 완료 상태에서 prod 환경만 추가 구축하는 것이 효율적
* 점진적 검증으로 위험 관리 가능
* 개발 생산성 유지하면서 운영 안정성 확보

---

## 📅 Detailed Implementation Plan

### Phase 1: Production 환경 설계 및 준비 (Week 1: 09/09-09/15)

**목표**: 운영 환경 구축을 위한 기반 작업 완료

| Task                     | Description                        | DoD                      | Risk   | 우선순위 |
| ------------------------ | ---------------------------------- | ------------------------ | ------ | ---- |
| Production Dockerfile 작성 | Frontend/Backend 운영용 Dockerfile 생성 | Multi-stage build 최적화 완료 | Low    | High |
| 환경변수 체계 설계               | dev/prod 구분되는 환경변수 구조 설계           | .env 파일 템플릿 완성           | Low    | High |
| Nginx 설정 파일 설계           | 리버스 프록시 및 정적 파일 서빙 설정              | 설정 파일 검증 완료              | Medium | High |

**완료 기준**:

* [ ] `backend/Dockerfile.prod` 생성 및 빌드 성공
* [ ] `frontend/Dockerfile.prod` 생성 및 빌드 성공
* [ ] `nginx/nginx.conf` 템플릿 작성 완료
* [ ] 환경변수 문서화 완료

### Phase 2: Docker Compose Production 구현 (Week 2: 09/16-09/22)

**목표**: docker-compose.prod.yml 완성 및 서비스 간 통신 검증

| Task                       | Description                   | DoD             | Risk   | 우선순위   |
| -------------------------- | ----------------------------- | --------------- | ------ | ------ |
| docker-compose.prod.yml 작성 | 운영 환경 컨테이너 구성 완료              | 모든 서비스 정상 기동    | Medium | High   |
| 서비스 간 네트워킹 설정              | 컨테이너 간 통신 및 보안 설정             | API 호출 정상 동작    | Medium | High   |
| 볼륨 및 데이터 영속성 구현            | PostgreSQL, Photos 데이터 영속성 보장 | 재시작 후 데이터 유지 확인 | Low    | Medium |

**완료 기준**:

* [ ] `docker-compose.prod.yml` 작성 완료
* [ ] 모든 컨테이너 정상 기동 확인
* [ ] Frontend ↔ Backend ↔ DB 통신 테스트 통과
* [ ] 사진 업로드/일정 등록 API 정상 동작

### Phase 3: HTTPS 및 보안 적용 (Week 3: 09/23-09/29)

**목표**: Let's Encrypt 인증서 자동화 및 보안 강화

| Task                 | Description                        | DoD               | Risk   | 우선순위   |
| -------------------- | ---------------------------------- | ----------------- | ------ | ------ |
| Certbot 컨테이너 구성      | Let's Encrypt 인증서 발급 자동화           | HTTPS 접근 정상 동작    | High   | High   |
| Nginx SSL + 보안 헤더 설정 | HTTPS 리디렉트 및 보안 헤더(HSTS, CSP 등) 적용 | 보안 테스트 통과         | Medium | High   |
| 인증서 갱신 자동화           | cron 기반 자동 갱신 스크립트 구현              | 자동 갱신 스크립트 테스트 통과 | High   | Medium |

**완료 기준**:

* [ ] HTTPS 인증서 발급 성공
* [ ] HTTP → HTTPS 자동 리다이렉트 동작
* [ ] 보안 헤더 5종(HSTS/XCTO/XFO/Referrer/CSP) 적용 확인
* [ ] 인증서 자동 갱신 스크립트 동작 확인
* [ ] /var/log/letsencrypt/cron.log 최신 로그 존재
* [ ] CERT\_OK / CERT\_WARN 상태 파일 로직 동작

---

## 🔐 Security Hardening (추가 보완)

### 필수 보안 헤더 목록

* Strict-Transport-Security (HSTS)
* X-Content-Type-Options
* X-Frame-Options
* Referrer-Policy
* Content-Security-Policy (최소 정책)

### nginx.conf 예시 (보안 헤더 포함)

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name your.domain.com;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your.domain.com;

    ssl_certificate     /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:;" always;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🕵️ 모니터링/알림 (간단 버전)

### Tasks

* [ ] 인증서 자동갱신 로그 파일 저장(`/var/log/letsencrypt/cron.log`)
* [ ] 인증서 만료일 주간 점검 → CERT\_OK / CERT\_WARN 파일 생성
* [ ] 갱신 성공 시 `nginx -s reload` 자동 수행

### crontab 예시

```bash
0 3 * * * certbot renew --post-hook "nginx -s reload" >> /var/log/letsencrypt/cron.log 2>&1
5 3 * * 1 /usr/local/bin/check_cert_expiry.sh >> /var/log/letsencrypt/cron.log 2>&1
```

---

## ⚡ 성능 기준 (보강)

### Performance Criteria

* API 응답시간: p95 < 500ms
* 정적 파일: p95 < 150ms
* 처리량: 30 RPS에서 위 기준 유지
* 리소스 여유: CPU < 70%, 메모리 < 80%

### k6 스모크 테스트 예시

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const base = 'https://your.domain.com';
  let r1 = http.get(`${base}/`);
  check(r1, { 'index 200': (res) => res.status === 200 });
  let r2 = http.get(`${base}/api/events`);
  check(r2, { 'events 200': (res) => res.status === 200 });
  sleep(1);
}
```

---

## ✅ Definition of Done (통합)

### Phase 1 DoD

* Backend/Frontend prod Dockerfile 빌드 성공
* Nginx 템플릿 작성, 환경변수 체계 문서화

### Phase 2 DoD

* docker-compose.prod.yml로 모든 컨테이너 정상 기동
* Frontend ↔ Backend ↔ DB 통신 OK
* 사진 업로드/일정 등록 API 정상 동작

### Phase 3 DoD (업데이트)

* SSL 인증서 발급 & HTTP→HTTPS 리다이렉트 OK
* 보안 헤더 5종 적용(HSTS/XCTO/XFO/Referrer/CSP)
* certbot renew 자동 갱신 + nginx reload 훅
* /var/log/letsencrypt/cron.log 생성/갱신 확인
* CERT\_OK / CERT\_WARN 상태 파일 로직 동작

### 성능 DoD

* k6 부하 테스트 p95 < 500ms, 실패율 < 1%
* 정적 파일 p95 < 150ms
* CPU < 70%, MEM < 80% (docker stats 기준)

### Overall DoD

* `docker-compose -f docker-compose.prod.yml up` 시 전체 서비스 구동
* HTTPS 접근 정상 동작, API/정적 리소스 정상
* 모바일/PC 접근 정상
* 보안 테스트 통과 (SSL Labs A+)

---

## 🚀 Next Actions

1. Production Dockerfile 작성 (Frontend/Backend)
2. docker-compose.prod.yml 초안 작성
3. Nginx 설정 파일 템플릿 생성
4. 환경변수 체계 설계 문서화

---

**📅 Last Updated**: 2025-09-09
**👤 Created By**: Claude Code (보완 by ChatGPT)
**📍 Status**: Ready for Implementation
