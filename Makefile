.PHONY: up down logs ps rebuild health migrate dev frontend help

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
	@echo "우리집 홈페이지 개발 환경 명령어"
	@echo ""
	@echo "Backend & Database:"
	@echo "  make up        - Start backend and database containers"
	@echo "  make down      - Stop all containers"
	@echo "  make dev       - Start full development environment"
	@echo "  make health    - Check API health status"
	@echo "  make logs      - Show container logs"
	@echo "  make ps        - Show container status"
	@echo ""
	@echo "Database:"  
	@echo "  make migrate   - Run database migrations"
	@echo "  make migration - Create new migration"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend  - Start frontend development server"
	@echo ""
	@echo "Maintenance:"
	@echo "  make rebuild   - Rebuild containers from scratch"
	@echo ""
	@echo "💡 Quick Start: run 'make dev' then 'make frontend' in another terminal"
