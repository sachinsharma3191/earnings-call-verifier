# 🐳 Docker Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### One-Command Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

This will:
1. Build the backend server image
2. Build the frontend UI image  
3. Start both services with proper networking
4. Health checks ensure backend is ready before frontend starts

### Access Points

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health

---

## Individual Service Deployment

### Backend Server Only

```bash
# Build server image
docker build -f Dockerfile.server -t earnings-verifier-server .

# Run server container
docker run -p 5001:5001 --env-file server/.env earnings-verifier-server
```

### Frontend UI Only

```bash
# Build frontend image
docker build -f Dockerfile.frontend -t earnings-verifier-ui .

# Run frontend container
docker run -p 3000:3000 earnings-verifier-ui
```

---

## Production Deployment

### Environment Configuration

1. **Backend Environment** (`server/.env`):
```env
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-production-secret-key
PORT=5001
ANTHROPIC_API_KEY=your-api-key-if-using-llm
```

2. **Frontend Environment**:
```bash
# Build with production API URL
VITE_API_URL=https://your-api-domain.com/api
```

### Docker Compose Production

```bash
# Production deployment
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

### Scaling Services

```bash
# Scale backend to handle more load
docker-compose up --build --scale server=3

# Check service status
docker-compose ps
```

---

## Monitoring & Logs

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs server
docker-compose logs ui
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Check backend health directly
curl http://localhost:5001/api/health
```

---

## Development with Docker

### Development Mode

```bash
# Mount source code for live reload
docker-compose -f docker-compose.dev.yml up
```

### Hot Reload Setup

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'
services:
  server:
    volumes:
      - ./server:/app
    environment:
      - FLASK_DEBUG=true
  
  ui:
    volumes:
      - ./ui:/app
      - /app/node_modules
    command: npm run dev
```

---

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
```bash
# Check what's using ports
lsof -i :3000
lsof -i :5001

# Kill processes if needed
kill -9 <PID>
```

2. **Build Failures**:
```bash
# Clean build cache
docker-compose down --volumes
docker-compose build --no-cache
```

3. **Permission Issues**:
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Debug Mode

```bash
# Run with debug output
docker-compose up --build --verbose

# Execute commands in container
docker-compose exec server bash
docker-compose exec ui sh
```

---

## Performance Optimization

### Resource Limits

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Caching

```bash
# Use build cache for faster builds
docker-compose build --parallel

# Pull latest base images
docker-compose pull
```

---

## Security Considerations

- ✅ Non-root user in backend container
- ✅ Health checks enabled
- ✅ Security headers in nginx
- ✅ Environment variables for secrets
- ✅ Proper CORS configuration

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy with Docker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        docker-compose -f docker-compose.yml up -d --build
```

---

**✅ Your application is now containerized and ready for production deployment!**
