# Docker Setup for RAO POC

This document explains how to run the Bank Customer Onboarding application using Docker.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose v2.0 or later
- 4GB of available RAM for Docker

## Quick Start

### Production Mode

1. **Build and start the services:**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Access the application:**
   - Application: http://localhost:3000
   - Redis: localhost:6379

3. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Development Mode

1. **Start development services with hot reload:**
   ```bash
   cd docker
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Access the application:**
   - Frontend (Vite): http://localhost:5173
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5434
   - Redis: localhost:6381

3. **Connect to development database:**
   ```bash
   # Using psql from host (if installed)
   psql -h localhost -p 5434 -U raopoc -d raopoc_dev
   
   # Or connect via Docker
   docker-compose -f docker-compose.dev.yml exec postgres psql -U raopoc -d raopoc_dev
   ```

## Configuration

### Environment Variables

1. **For production**, copy `.env.docker` to `.env`:
   ```bash
   cp .env.docker .env
   ```

2. **Important variables to configure:**
   - `API_URL`: Your production API URL (if different from default)
   - `SESSION_SECRET`: A secure random string for sessions
   - `ENCRYPTION_KEY`: Base64-encoded 32-byte key for encryption

### Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### SSL Certificates (Production)

Caddy automatically handles SSL certificates:

- **For localhost domains**: Caddy generates self-signed certificates automatically
- **For production domains**: Caddy automatically obtains and renews Let's Encrypt certificates
- **No manual certificate management needed**: Just update your domain in `Caddyfile.docker`

## Docker Commands

### Build Images

```bash
# Build production image
docker-compose build

# Build development image
docker-compose -f docker-compose.dev.yml build
```

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec app sh
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

## Volumes

The application uses these Docker volumes:

- `redis-data`: Redis persistence data
- `app-data`: Application data (encryption keys, etc.)
- `./applications`: Customer application JSON files (mounted)

## Health Checks

The application includes health checks:

- **Redis**: Checks `redis-cli ping`
- **App**: Checks `/api/config/states` endpoint

You can verify health status:
```bash
docker-compose ps
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

1. **Change ports in docker-compose.yml:**
   ```yaml
   ports:
     - "3001:3000"  # Change external port
   ```

2. **Or stop conflicting services:**
   ```bash
   lsof -i :3000  # Find process using port
   kill -9 <PID>  # Stop the process
   ```

### Permission Issues

If you encounter permission errors:

```bash
# Fix ownership of mounted volumes
sudo chown -R $(id -u):$(id -g) applications/
```

### Build Cache Issues

Clear Docker build cache:

```bash
docker-compose build --no-cache
```

### Memory Issues

Increase Docker memory allocation in Docker Desktop settings (minimum 4GB recommended).

## Production Deployment

### Using Docker Swarm

1. **Initialize Swarm:**
   ```bash
   docker swarm init
   ```

2. **Deploy stack:**
   ```bash
   docker stack deploy -c docker-compose.yml raopoc
   ```

### Using Kubernetes

See `kubernetes/` directory for Kubernetes deployment manifests (if available).

## Security Considerations

1. **Change default passwords** in production
2. **Use strong SESSION_SECRET** value
3. **Configure ENCRYPTION_KEY** for data security
4. **Use HTTPS** in production (via Nginx or load balancer)
5. **Limit Redis exposure** (only accessible within Docker network)
6. **Regular security updates** for base images

## Backup and Restore

### Backup Redis Data

```bash
# Create backup
docker-compose exec redis redis-cli BGSAVE
docker cp raopoc-redis:/data/dump.rdb ./backup/redis-backup-$(date +%Y%m%d).rdb
```

### Backup Application Data

```bash
# Backup encryption keys and application data
docker cp raopoc-app:/app/data ./backup/app-data-$(date +%Y%m%d)
```

### Restore Data

```bash
# Restore Redis
docker cp ./backup/redis-backup.rdb raopoc-redis:/data/dump.rdb
docker-compose restart redis

# Restore app data
docker cp ./backup/app-data raopoc-app:/app/data
docker-compose restart app
```