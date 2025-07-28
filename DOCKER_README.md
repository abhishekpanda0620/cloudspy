# CloudSpy Docker Deployment Guide

This guide covers how to deploy CloudSpy using Docker and Docker Compose.

## 🏗️ Architecture Overview

CloudSpy uses a microservices architecture with the following components:

- **Frontend**: Next.js application (React + TypeScript)
- **Backend**: FastAPI application (Python)
- **Database**: PostgreSQL 15 with extensions
- **Cache**: Redis for session management and caching
- **Reverse Proxy**: Nginx (production only)
- **Background Workers**: Celery workers (production only)

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd cloudspy
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```bash
# Required: Update these values
SECRET_KEY=your-super-secret-key-change-in-production
POSTGRES_PASSWORD=your-secure-password
REDIS_PASSWORD=your-redis-password

# Cloud Provider Credentials
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
GCP_PROJECT_ID=your-gcp-project
AZURE_TENANT_ID=your-azure-tenant
```

### 3. Start Services

```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production mode
docker-compose --profile production up -d
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🛠️ Development Setup

### Hot Reload Development

```bash
# Start with file watching and hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# View logs
docker-compose logs -f backend frontend
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U cloudspy_user -d cloudspy

# Run migrations (when implemented)
docker-compose exec backend alembic upgrade head

# Backup database
docker-compose exec postgres pg_dump -U cloudspy_user cloudspy > backup.sql
```

### Redis Management

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Monitor Redis
docker-compose exec redis redis-cli monitor
```

## 🏭 Production Deployment

### 1. SSL Certificates

Create SSL certificates for HTTPS:

```bash
mkdir -p nginx/ssl
# Add your SSL certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

### 2. Production Environment

```bash
# Copy and configure production environment
cp .env.example .env.production

# Update production values
vim .env.production
```

### 3. Deploy with All Services

```bash
# Start all services including Nginx, workers, and scheduler
docker-compose --profile production --env-file .env.production up -d

# Check service health
docker-compose ps
docker-compose logs nginx
```

### 4. Monitoring

```bash
# View all service logs
docker-compose logs -f

# Monitor specific service
docker-compose logs -f backend

# Check resource usage
docker stats
```

## 🔧 Service Configuration

### Backend Configuration

Key environment variables for the backend:

```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/cloudspy
REDIS_URL=redis://:password@redis:6379/0
SECRET_KEY=your-secret-key
DEBUG=false
LOG_LEVEL=INFO
```

### Frontend Configuration

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Development
NEXT_PUBLIC_API_URL=https://api.yourdomain.com  # Production
NODE_ENV=production
```

### Database Schema

The database is automatically initialized with:
- User management tables
- Cloud integration configurations
- Cost data storage
- Resource tracking
- Audit logs and sync history

## 📊 Monitoring and Maintenance

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

### Log Management

```bash
# View logs by service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f --tail=100 backend

# Export logs
docker-compose logs --no-color > cloudspy.log
```

### Backup and Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U cloudspy_user cloudspy | gzip > backup-$(date +%Y%m%d).sql.gz

# Database restore
gunzip -c backup-20240101.sql.gz | docker-compose exec -T postgres psql -U cloudspy_user cloudspy

# Volume backup
docker run --rm -v cloudspy_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY (32+ characters)
- [ ] Enable SSL/TLS with valid certificates
- [ ] Configure firewall rules
- [ ] Set up log monitoring
- [ ] Enable database encryption at rest
- [ ] Use secrets management for cloud credentials
- [ ] Regular security updates

### Network Security

```bash
# Create custom network with encryption
docker network create --driver overlay --opt encrypted cloudspy-secure

# Use in docker-compose.yml
networks:
  cloudspy-network:
    external: true
    name: cloudspy-secure
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   # Change ports in docker-compose.yml
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres
   # Verify connection
   docker-compose exec backend python -c "import psycopg2; print('DB OK')"
   ```

3. **Memory issues**:
   ```bash
   # Check resource usage
   docker stats
   # Increase Docker memory limit
   ```

4. **SSL certificate issues**:
   ```bash
   # Verify certificate
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   # Check Nginx config
   docker-compose exec nginx nginx -t
   ```

### Performance Tuning

```bash
# Optimize PostgreSQL
echo "shared_preload_libraries = 'pg_stat_statements'" >> postgresql.conf

# Redis memory optimization
echo "maxmemory 256mb" >> redis.conf
echo "maxmemory-policy allkeys-lru" >> redis.conf

# Nginx worker processes
echo "worker_processes auto;" >> nginx.conf
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend workers
docker-compose up -d --scale backend=3

# Scale Celery workers
docker-compose up -d --scale worker=5

# Load balancer configuration needed for multiple backend instances
```

### Database Scaling

```bash
# Read replicas (requires configuration)
docker-compose -f docker-compose.yml -f docker-compose.replicas.yml up -d

# Connection pooling
# Add PgBouncer service to docker-compose.yml
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Zero-downtime deployment (with load balancer)
docker-compose up -d --no-deps backend
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

This Docker setup provides a robust, scalable foundation for CloudSpy that can grow from development to enterprise production deployment.