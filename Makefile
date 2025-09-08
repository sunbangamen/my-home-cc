.PHONY: up down logs ps rebuild

up:
	docker compose -f docker-compose.dev.yml up --build -d

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

ps:
	docker compose -f docker-compose.dev.yml ps

rebuild:
	docker compose -f docker-compose.dev.yml build --no-cache
