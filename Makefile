.PHONY: up down logs ps rebuild health migrate dev frontend help prod-up prod-down prod-logs prod-ps prod-build prod-health prod-migrate init-ssl

# Start backend and database containers
up:
	docker compose -f docker-compose.dev.yml up --build -d

# Stop all containers  
down:
	docker compose -f docker-compose.dev.yml down

# Show container logs
logs:
	docker compose -f docker-compose.dev.yml logs -f

# Show container status
ps:
	docker compose -f docker-compose.dev.yml ps

# Rebuild containers from scratch
rebuild:
	docker compose -f docker-compose.dev.yml build --no-cache

# Check API health status
health:
	@echo "Checking API health..."
	@curl -s http://localhost:8000/api/health | python3 -m json.tool || echo "API not responding"

# Run database migrations
migrate:
	docker compose -f docker-compose.dev.yml exec backend alembic upgrade head

# Create new migration
migration:
	@read -p "Migration name: " name; \
	docker compose -f docker-compose.dev.yml exec backend alembic revision --autogenerate -m "$$name"

# Start full development environment
dev:
	@echo "Starting development environment..."
	$(MAKE) up
	@echo "Waiting for services to be ready..."
	@sleep 10
	$(MAKE) health
	@echo ""
	@echo "🚀 Development environment ready!"
	@echo "📍 API server: http://localhost:8000"
	@echo "📍 API docs: http://localhost:8000/docs"
	@echo "📍 Frontend: http://localhost:5173 (run 'make frontend' in another terminal)"
	@echo ""
	@echo "📝 Useful commands:"
	@echo "   make logs    - Show container logs"
	@echo "   make health  - Check API health"
	@echo "   make migrate - Run database migrations"
	@echo "   make down    - Stop all containers"

# Start frontend development server
frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Show help
help:
	@echo "우리집 홈페이지 개발/운영 환경 명령어"
	@echo ""
	@echo "🛠️  Development Environment:"
	@echo "  make up        - Start backend and database containers"
	@echo "  make down      - Stop all containers"
	@echo "  make dev       - Start full development environment"
	@echo "  make health    - Check API health status"
	@echo "  make logs      - Show container logs"
	@echo "  make ps        - Show container status"
	@echo "  make frontend  - Start frontend development server"
	@echo ""
	@echo "🗄️  Database:"  
	@echo "  make migrate   - Run database migrations"
	@echo "  make migration - Create new migration"
	@echo ""
	@echo "🚀 Production Environment:"
	@echo "  make init-ssl     - Initialize SSL certificates"
	@echo "  make prod-up      - Start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-deploy  - Full production deployment"
	@echo "  make prod-health  - Check production API health"
	@echo "  make prod-logs    - Show production logs"
	@echo "  make prod-ps      - Show production container status"
	@echo "  make prod-migrate - Run production migrations"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  make rebuild      - Rebuild dev containers"
	@echo "  make prod-build   - Rebuild production containers"
	@echo ""
	@echo "💡 Quick Start (Development): make dev && make frontend"
	@echo "🌟 Quick Start (Production): make init-ssl && make prod-deploy"

# === PRODUCTION COMMANDS ===

# Initialize SSL certificates
init-ssl:
	@echo "🔐 Initializing SSL certificates..."
	@./scripts/init-ssl.sh

# Start production environment
prod-up:
	@echo "🚀 Starting production environment..."
	docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# Stop production environment
prod-down:
	@echo "🛑 Stopping production environment..."
	docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Show production logs
prod-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Show production container status
prod-ps:
	docker compose -f docker-compose.prod.yml --env-file .env.prod ps

# Build production images
prod-build:
	@echo "🔨 Building production images..."
	docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

# Check production API health
prod-health:
	@echo "🏥 Checking production API health..."
	@DOMAIN=$$(grep DOMAIN_NAME .env.prod | cut -d= -f2) && \
	if [ "$$DOMAIN" = "yourdomain.com" ]; then \
		curl -s https://localhost/api/health | python3 -m json.tool || echo "API not responding"; \
	else \
		curl -s https://$$DOMAIN/api/health | python3 -m json.tool || echo "API not responding"; \
	fi

# Run production database migrations
prod-migrate:
	@echo "🗄️ Running production database migrations..."
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend alembic upgrade head

# Full production deployment
prod-deploy:
	@echo "🌟 Starting full production deployment..."
	@echo ""
	@echo "Step 1/4: Building images..."
	$(MAKE) prod-build
	@echo ""
	@echo "Step 2/4: Starting services..."
	$(MAKE) prod-up
	@echo ""
	@echo "Step 3/4: Waiting for services to be ready..."
	@sleep 30
	@echo ""
	@echo "Step 4/4: Running migrations..."
	$(MAKE) prod-migrate
	@echo ""
	@echo "🎉 Production deployment completed!"
	@echo ""
	@DOMAIN=$$(grep DOMAIN_NAME .env.prod | cut -d= -f2) && \
	echo "🌐 Application URL: https://$$DOMAIN" && \
	echo "📊 API Documentation: https://$$DOMAIN/api/docs" && \
	echo "📱 Health Check: https://$$DOMAIN/api/health"
	@echo ""
	@echo "📝 Useful production commands:"
	@echo "   make prod-logs   - Show production logs"
	@echo "   make prod-health - Check API health"
	@echo "   make prod-ps     - Show container status"
	@echo "   make prod-down   - Stop all services"
