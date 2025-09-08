#!/usr/bin/env bash
set -euo pipefail

# ============================================
# 우리집 홈페이지 - 스캐폴드 생성물 정리 스크립트
# --------------------------------------------
# 기능:
#  - 컨테이너 중지/삭제 (dev용)
#  - backend/, frontend/, docker-compose.dev.yml, Makefile, .env.* 등 삭제
#  - docs/ 폴더와 현재 스크립트들은 남김
# 옵션:
#  -y : 확인 없이 진행
#  --keep-images : 도커 이미지/볼륨 삭제 건너뛰기
# ============================================

YES=false
KEEP_IMAGES=false
for arg in "$@"; do
  case "$arg" in
    -y) YES=true ;;
    --keep-images) KEEP_IMAGES=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

confirm () {
  $YES && return 0
  read -r -p "⚠️ docs/를 제외한 스캐폴드 산출물을 삭제합니다. 진행할까요? [y/N] " ans
  [[ "${ans:-}" =~ ^[Yy]$ ]]
}

echo "🧹 정리 작업 시작"
if confirm; then
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    if [[ -f docker-compose.dev.yml ]]; then
      echo "⛔ 컨테이너 중지/제거"
      docker compose -f docker-compose.dev.yml down -v || true
    fi
  else
    echo "ℹ️ docker compose 미사용 환경, 컨테이너 정리는 건너뜁니다."
  fi

  # 삭제 대상 목록 (docs/ 및 *.sh, .git/ 는 보존)
  TO_DELETE=(
    "backend"
    "frontend"
    "docker-compose.dev.yml"
    "Makefile"
    ".env"
    ".env.*"
    ".gitignore"
  )

  for item in "${TO_DELETE[@]}"; do
    for path in $item; do
      if [[ -e "$path" ]]; then
        echo "🗑️  삭제: $path"
        rm -rf "$path"
      fi
    done
  done

  if ! $KEEP_IMAGES; then
    echo "🗄️  dangling 이미지/볼륨 정리(옵션)"
    docker image prune -f || true
    docker volume prune -f || true
  else
    echo "⏭️  --keep-images 지정으로 이미지/볼륨 정리 건너뜀"
  fi

  echo "✅ 정리 완료: docs/ 와 *.sh 스크립트는 보존되었습니다."
else
  echo "취소했습니다."
fi
