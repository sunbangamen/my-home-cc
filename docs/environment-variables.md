# Environment Variables Documentation

## Overview
This document describes the environment variable system for dev/prod environment separation.

## File Structure
```
├── .env.dev                    # Development Docker Compose variables
├── .env.prod                   # Production Docker Compose variables
├── backend/.env.dev            # Development Backend variables
└── backend/.env.prod           # Production Backend variables
```

## Development vs Production

### Development Environment
- **Frontend**: Vite dev server (hot reload)
- **Backend**: FastAPI with reload enabled
- **Database**: PostgreSQL in container
- **HTTPS**: Not enabled (HTTP only)

### Production Environment
- **Frontend**: Static build served by Nginx
- **Backend**: FastAPI with multiple workers
- **Database**: PostgreSQL with persistent volumes
- **HTTPS**: Let's Encrypt SSL certificates

## Environment Variables

### Docker Compose Variables (.env.dev / .env.prod)

| Variable | Dev Value | Prod Value | Description |
|----------|-----------|------------|-------------|
| `DOMAIN_NAME` | localhost | yourdomain.com | Domain name for SSL |
| `EMAIL` | - | admin@yourdomain.com | Email for Let's Encrypt |
| `POSTGRES_USER` | home | home | Database user |
| `POSTGRES_PASSWORD` | homepw | homepw | Database password |
| `POSTGRES_DB` | homepg | homepg | Database name |
| `COMPOSE_PROJECT_NAME` | home-app-dev | home-app-prod | Docker project name |

### Backend Variables (backend/.env.dev / backend/.env.prod)

| Variable | Dev Value | Prod Value | Description |
|----------|-----------|------------|-------------|
| `ENV` | development | production | Environment mode |
| `DEBUG` | true | false | Debug mode |
| `LOG_LEVEL` | debug | info | Logging level |
| `DATABASE_URL` | postgresql://home:homepw@db:5432/homepg | postgresql://home:homepw@postgres:5432/homepg | Database connection |
| `CORS_ORIGINS` | http://localhost:3000,http://localhost:5173 | https://yourdomain.com | CORS allowed origins |
| `HOST` | 0.0.0.0 | 0.0.0.0 | Server host |
| `PORT` | 8000 | 8000 | Server port |
| `WORKERS` | 1 | 2 | Uvicorn workers |

## Security Considerations

### Production Secrets
The following variables contain sensitive information and should be changed in production:

1. **POSTGRES_PASSWORD**: Change from default `homepw`
2. **SECRET_KEY**: Generate a strong secret key for JWT tokens
3. **EMAIL**: Use a valid email for Let's Encrypt notifications

### Example Secret Generation
```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate a secure database password
openssl rand -base64 32
```

## Usage Examples

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml --env-file .env.dev up

# Start frontend separately
cd frontend && npm run dev
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Environment Validation

### Backend Environment Validation
The FastAPI application should validate required environment variables on startup:

```python
import os
from typing import Optional

class Settings:
    def __init__(self):
        self.env = os.getenv("ENV", "development")
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.database_url = os.getenv("DATABASE_URL")
        
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        if self.env == "production" and self.debug:
            raise ValueError("DEBUG must be false in production")

settings = Settings()
```

## Migration Guide

### From Development to Production
1. Copy `.env.dev` to `.env.prod`
2. Copy `backend/.env.dev` to `backend/.env.prod`
3. Update production-specific values (domain, passwords, etc.)
4. Set `ENV=production` and `DEBUG=false`
5. Configure SSL certificates and domain settings

### Environment Variable Precedence
1. Docker Compose `--env-file` parameter
2. Docker Compose `environment:` section
3. Container's `.env` file
4. System environment variables