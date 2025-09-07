# Berry Material React - Docker Setup

This document describes how to run the Berry Material React application using Docker containers for both development and production environments.

## 🏗️ Architecture

### Multi-stage Dockerfile

- **Builder**: Builds the React application
- **Development**: Runs Vite dev server with hot reload  
- **Production**: Serves built files with Node.js serve package

### Services

- **React App**: Main application container
- **Redis**: Session storage and caching (optional)
- **PostgreSQL**: Database (optional)

## 🚀 Quick Start

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v2+
- Node.js 22+ (for local development)

### Environment Setup

First, create your environment configuration:

```bash
# Copy the sample environment file
cp .env.sample .env

# Edit the .env file with your preferred settings
# The script will automatically copy .env.sample to .env if it doesn't exist
```

### Development Environment

```bash
# Start development environment
./docker-manager.sh dev

# Or manually
docker-compose up -d

# Access the application
open http://localhost:5173
```

### Production Environment

```bash
# Start production environment  
./docker-manager.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Access the application
open http://localhost:80
```

## 📋 Available Commands

### Using Docker Manager Script

```bash
# Development
./docker-manager.sh dev          # Start dev environment
./docker-manager.sh dev-build    # Build and start dev environment
./docker-manager.sh dev-stop     # Stop dev environment
./docker-manager.sh dev-logs     # Show dev logs

# Production
./docker-manager.sh prod         # Start prod environment
./docker-manager.sh prod-build   # Build and start prod environment
./docker-manager.sh prod-stop    # Stop prod environment
./docker-manager.sh prod-logs    # Show prod logs

# Cleanup
./docker-manager.sh clean        # Remove all containers and volumes
./docker-manager.sh prune        # Clean up Docker system
```

### Using Docker Compose Directly

```bash
# Development
docker-compose up -d                    # Start services
docker-compose up -d --build           # Rebuild and start
docker-compose down                     # Stop services
docker-compose logs -f berry-react-dev # View logs

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f berry-react-prod
```

## 🔧 Configuration

### Environment Variables

The application uses a single `.env` file for all environments. Copy `.env.sample` to `.env` and adjust values as needed:

```bash
cp .env.sample .env
```

Key configuration options:

```env
# Application Settings
NODE_ENV=development
VITE_APP_VERSION=3.9.0
VITE_APP_BASE_NAME=/
VITE_APP_API_URL=http://localhost:3001

# Database Configuration
POSTGRES_DB=berry_db
POSTGRES_USER=berry_user
POSTGRES_PASSWORD=berry_pass
POSTGRES_DATA_PATH=./postgres_data

# Container Ports
REACT_PORT=5173
NGINX_PORT=80
POSTGRES_PORT_HOST=5432
REDIS_PORT_HOST=6379
```

### Port Mapping

| Service | Development | Production |
|---------|-------------|------------|
| React App | ${REACT_PORT:-5173} | ${REACT_PROD_PORT:-3000} |
| PostgreSQL | ${POSTGRES_PORT_HOST:-5432} | - (internal) |
| Redis | ${REDIS_PORT_HOST:-6379} | - (internal) |

### Database Storage

- **Development**: PostgreSQL data is stored in `${POSTGRES_DATA_PATH:-./postgres_data}` directory
- **Production**: PostgreSQL data is stored in `${POSTGRES_DATA_PATH:-./postgres_data_prod}` directory
- **Redis**: Uses Docker volumes for persistence

## 🗂️ Volumes

### Development
- Source code mounted for hot reload
- Node modules preserved in container

### Production
- Named volumes for database persistence
- Application served from built assets

## 🔒 Security Features

### Development
- Basic container isolation
- Non-privileged user execution

### Production
- Security headers configured
- Rate limiting for API endpoints
- Container resource limits
- Health checks enabled
- Non-root user execution
- Secure password handling

## 🚨 Health Checks

All services include health checks:
- **React App**: HTTP endpoint check
- **Database**: Connection test
- **Redis**: Ping command
- **Nginx**: Service availability

## 📊 Monitoring

### Logs
```bash
# View all services logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f berry-react-dev
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# View container processes
docker-compose top
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5173
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Permission Denied**
   ```bash
   # Fix script permissions
   chmod +x docker-manager.sh
   ```

3. **Container Build Fails**
   ```bash
   # Clear build cache
   docker-compose build --no-cache
   ```

4. **Volume Issues**
   ```bash
   # Reset volumes
   docker-compose down -v
   docker-compose up -d
   ```

### Debug Mode
```bash
# Run container interactively
docker-compose run --rm berry-react-dev sh

# Execute commands in running container
docker-compose exec berry-react-dev sh
```

## 🚀 Production Deployment

### Before Deploying
1. Update `.env.prod` with production values
2. Configure domain and SSL certificates
3. Set up monitoring and logging
4. Review security settings

### Scaling
```bash
# Scale specific services
docker-compose -f docker-compose.prod.yml up -d --scale berry-react-prod=3
```

### Updates
```bash
# Zero-downtime deployment
docker-compose -f docker-compose.prod.yml up -d --no-deps berry-react-prod
```

## 📝 Notes

- The application uses Vite for development server
- Production builds are optimized and minified
- Hot module replacement works in development
- Static files are cached in production
- Database and Redis are optional components

## 🆘 Support

If you encounter issues:
1. Check the logs: `./docker-manager.sh dev-logs`
2. Verify environment variables
3. Ensure Docker Desktop is running
4. Check port availability
5. Review Docker and container logs
