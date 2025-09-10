# Production Deployment Guide

## 🚀 Phase 1 완료 - Production 환경 구축

**완료일**: 2025-09-09  
**구현 범위**: Phase 1 (Production 환경 설계 및 준비) 완료  

---

## ✅ 구현 완료 사항

### 1. Production Dockerfiles
- ✅ `backend/Dockerfile.prod` - FastAPI 운영용 멀티스테이지 빌드
- ✅ `frontend/Dockerfile.prod` - React + Nginx 운영용 빌드
- ✅ 보안 강화: 비루트 사용자 실행, 최소 권한 원칙

### 2. Docker Compose Production 구성
- ✅ `docker-compose.prod.yml` - 완전한 운영 환경 구성
- ✅ 서비스별 헬스체크 및 재시작 정책
- ✅ 리소스 제한 및 네트워크 격리
- ✅ 볼륨 영속성 보장

### 3. Nginx 리버스 프록시
- ✅ `nginx/nginx.conf` - HTTPS 리디렉트 및 보안 헤더
- ✅ SSL 인증서 자동 갱신 지원
- ✅ 정적 파일 캐싱 및 Gzip 압축

### 4. 환경변수 체계
- ✅ `.env.prod` - 운영 환경 설정
- ✅ `backend/.env.prod` - 백엔드 운영 설정
- ✅ 개발/운영 환경 완전 분리

### 5. SSL 자동화
- ✅ `scripts/init-ssl.sh` - Let's Encrypt 초기 설정 스크립트
- ✅ Certbot 자동 갱신 컨테이너
- ✅ 도메인 검증 및 인증서 발급 자동화

### 6. 운영 도구
- ✅ Makefile 운영 명령어 추가
- ✅ `make prod-up`, `make prod-deploy` 등
- ✅ 헬스체크 및 로그 모니터링 지원

---

## 🏗 아키텍처 개요

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │   Nginx         │    │   Frontend      │
│                 │    │   (Reverse      │    │   (React +      │
│   HTTPS:443     │────│   Proxy +       │────│   Nginx)        │
│   HTTP:80       │    │   SSL)          │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Backend       │    │   PostgreSQL    │
                       │   (FastAPI)     │────│   Database      │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Photos        │    │   Let's Encrypt │
                       │   Volume        │    │   Certificates  │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

---

## 📋 사전 준비사항

### 1. 도메인 및 DNS 설정
```bash
# 도메인이 서버 IP를 가리키도록 DNS A 레코드 설정
yourdomain.com → YOUR_SERVER_IP
```

### 2. 서버 요구사항
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2+
- **RAM**: 최소 2GB (권장 4GB+)
- **Storage**: 최소 20GB (권장 50GB+)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 3. 방화벽 설정
```bash
# HTTP/HTTPS 포트 열기
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

## 🚀 배포 절차

### Step 1: 환경 설정
```bash
# 1. 환경변수 파일 복사 및 수정
cp .env.prod.example .env.prod
cp backend/.env.prod.example backend/.env.prod

# 2. 도메인 및 이메일 설정
nano .env.prod
```

**필수 설정 사항**:
```bash
# .env.prod
DOMAIN_NAME=yourdomain.com          # 실제 도메인으로 변경
EMAIL=admin@yourdomain.com          # 실제 이메일로 변경

# 보안을 위해 기본 비밀번호들 변경 권장
POSTGRES_PASSWORD=your_secure_password
```

### Step 2: SSL 인증서 초기화
```bash
# Let's Encrypt 인증서 발급
make init-ssl

# 또는 직접 실행
./scripts/init-ssl.sh
```

### Step 3: 운영 환경 배포
```bash
# 전체 배포 (권장)
make prod-deploy

# 또는 단계별 실행
make prod-build    # 이미지 빌드
make prod-up       # 서비스 시작
make prod-migrate  # DB 마이그레이션
```

### Step 4: 배포 확인
```bash
# 서비스 상태 확인
make prod-ps

# 로그 확인
make prod-logs

# 헬스체크
make prod-health

# 웹 브라우저에서 확인
# https://yourdomain.com
```

---

## 🔧 운영 명령어

### 기본 명령어
```bash
make prod-up      # 운영 환경 시작
make prod-down    # 운영 환경 중지
make prod-ps      # 컨테이너 상태 확인
make prod-logs    # 로그 실시간 확인
```

### 유지보수 명령어
```bash
make prod-build   # 이미지 재빌드
make prod-health  # API 헬스체크
make prod-migrate # DB 마이그레이션 실행
```

### 배포 명령어
```bash
make init-ssl     # SSL 인증서 초기 설정
make prod-deploy  # 전체 배포 프로세스
```

---

## 🔐 보안 설정

### 1. SSL/TLS 보안 헤더
```nginx
# 자동 적용되는 보안 헤더들
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff  
X-Frame-Options: DENY
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'; ...
```

### 2. 인증서 자동 갱신
- **갱신 주기**: 12시간마다 체크
- **갱신 로그**: `/var/log/letsencrypt/cron.log`
- **수동 갱신**: `docker exec certbot certbot renew`

### 3. 컨테이너 보안
- 모든 컨테이너 비루트 사용자로 실행
- 불필요한 포트 노출 차단
- 리소스 제한으로 DoS 공격 방지

---

## 📊 모니터링 및 로그

### 로그 위치
```bash
# 애플리케이션 로그
docker logs home-app-prod-backend
docker logs home-app-prod-frontend
docker logs home-app-prod-nginx

# SSL 갱신 로그
docker exec home-app-prod-certbot cat /var/log/letsencrypt/cron.log
```

### 헬스체크 엔드포인트
```bash
# API 헬스체크
curl https://yourdomain.com/api/health

# Frontend 상태 확인
curl https://yourdomain.com/

# SSL 인증서 상태
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 🛠 트러블슈팅

### 1. SSL 인증서 발급 실패
```bash
# 도메인 접근성 확인
curl -I http://yourdomain.com

# 포트 80이 열려있는지 확인
sudo netstat -tlnp | grep :80

# Let's Encrypt 로그 확인
docker logs home-app-prod-certbot
```

### 2. 컨테이너 시작 실패
```bash
# 상세 로그 확인
docker logs home-app-prod-backend --tail 50

# 리소스 사용량 확인  
docker stats

# 포트 충돌 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 3. 데이터베이스 연결 문제
```bash
# 데이터베이스 상태 확인
docker logs home-app-prod-postgres

# 네트워크 연결 확인
docker network ls
docker network inspect home-app-prod_app-network
```

### 4. 파일 업로드 문제
```bash
# 볼륨 권한 확인
docker exec home-app-prod-backend ls -la /data/photos

# 디스크 용량 확인
df -h
```

---

## 📈 성능 최적화

### 1. 리소스 제한 조정
```yaml
# docker-compose.prod.yml에서 조정
deploy:
  resources:
    limits:
      memory: 1G      # 메모리 제한 증가
      cpus: '1.0'     # CPU 제한 설정
```

### 2. 캐시 설정
```nginx
# nginx.conf에서 캐시 기간 조정
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;  # 캐시 기간 연장
}
```

### 3. 데이터베이스 튜닝
```bash
# PostgreSQL 설정 최적화 (필요시)
docker exec -it home-app-prod-postgres psql -U home -d homepg
```

---

## 🔄 업데이트 절차

### 1. 코드 업데이트
```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 이미지 재빌드
make prod-build

# 3. 서비스 재시작 (무중단)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 2. 롤백 절차
```bash
# 이전 이미지 태그로 롤백
git checkout <previous-commit>
make prod-build
make prod-up
```

---

## 📝 Phase 2/3 다음 단계 예정

### Phase 2: HTTPS 및 보안 적용 (예정)
- [ ] Let's Encrypt 인증서 자동 갱신 테스트
- [ ] 보안 헤더 검증 (SSL Labs A+ 등급)
- [ ] 성능 테스트 및 최적화

### Phase 3: 운영 안정화 (예정)  
- [ ] 모니터링 대시보드 구축
- [ ] 백업 및 복구 절차
- [ ] CI/CD 파이프라인 구축

---

## ✋ 주의사항

1. **도메인 준비 필수**: Let's Encrypt 인증서 발급을 위해 실제 도메인이 서버를 가리켜야 합니다.
2. **방화벽 설정**: 80/443 포트가 열려있어야 합니다.
3. **리소스 모니터링**: 운영 중 메모리/CPU 사용량을 지속적으로 모니터링하세요.
4. **백업**: 정기적으로 데이터베이스와 사진 파일을 백업하세요.
5. **보안 업데이트**: 정기적으로 Docker 이미지를 업데이트하세요.

---

**🎉 Phase 1 완료!**  
Production 환경의 기반이 완성되었습니다. 실제 도메인 설정 후 `make init-ssl && make prod-deploy` 명령으로 운영 배포가 가능합니다.