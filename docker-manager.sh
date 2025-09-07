#!/bin/bash

# Berry Material React Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    echo "Berry Material React + NestJS Docker Management"
    echo ""
    echo "Usage: $0 [COMMAND] [SERVICE]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  dev-build   Build and start development environment"
    echo "  dev-stop    Stop development environment"
    echo "  dev-logs    Show development logs [dashboard|backend]"
    echo ""
    echo "  prod        Start production environment"
    echo "  prod-build  Build and start production environment"
    echo "  prod-stop   Stop production environment"
    echo "  prod-logs   Show production logs [dashboard|backend]"
    echo ""
    echo "  clean       Remove all containers and volumes"
    echo "  prune       Clean up Docker system"
    echo "  help        Show this help message"
    echo ""
    echo "Services:"
    echo "  dashboard   React frontend (port 5173/3000)"
    echo "  backend     NestJS API (port 3001)"
    echo "  postgres    PostgreSQL database (port 5432)"
    echo "  redis       Redis cache (port 6379)"
    echo ""
}

# Development commands
dev_start() {
    print_info "Starting development environment..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.sample..."
        cp .env.sample .env
        print_info "Please review and update .env file if needed"
    fi
    docker-compose up -d
    print_info "Development environment started!"
    print_info "Dashboard (React): http://localhost:${REACT_PORT:-5173}"
    print_info "Backend API: http://localhost:${BACKEND_PORT:-3001}"
}

dev_build() {
    print_info "Building and starting development environment..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.sample..."
        cp .env.sample .env
        print_info "Please review and update .env file if needed"
    fi
    docker-compose up -d --build
    print_info "Development environment built and started!"
    print_info "Dashboard (React): http://localhost:${REACT_PORT:-5173}"
    print_info "Backend API: http://localhost:${BACKEND_PORT:-3001}"
}

dev_stop() {
    print_info "Stopping development environment..."
    docker-compose down
    print_info "Development environment stopped!"
}

dev_logs() {
    print_info "Showing development logs..."
    if [ "$2" = "dashboard" ]; then
        docker-compose logs -f dashboard-react
    elif [ "$2" = "backend" ]; then
        docker-compose logs -f backend-api
    else
        docker-compose logs -f
    fi
}

# Production commands
prod_start() {
    print_info "Starting production environment..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.sample..."
        cp .env.sample .env
        print_info "Please review and update .env file for production"
    fi
    docker-compose -f docker-compose.prod.yml up -d
    print_info "Production environment started!"
    print_info "Dashboard (React): http://localhost:${REACT_PROD_PORT:-3000}"
    print_info "Backend API: http://localhost:${BACKEND_PORT:-3001}"
}

prod_build() {
    print_info "Building and starting production environment..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.sample..."
        cp .env.sample .env
        print_info "Please review and update .env file for production"
    fi
    docker-compose -f docker-compose.prod.yml up -d --build
    print_info "Production environment built and started!"
    print_info "Dashboard (React): http://localhost:${REACT_PROD_PORT:-3000}"
    print_info "Backend API: http://localhost:${BACKEND_PORT:-3001}"
}

prod_stop() {
    print_info "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    print_info "Production environment stopped!"
}

prod_logs() {
    print_info "Showing production logs..."
    if [ "$2" = "dashboard" ]; then
        docker-compose -f docker-compose.prod.yml logs -f dashboard-react
    elif [ "$2" = "backend" ]; then
        docker-compose -f docker-compose.prod.yml logs -f backend-api
    else
        docker-compose -f docker-compose.prod.yml logs -f
    fi
}

# Cleanup commands
clean_all() {
    print_warning "This will remove all containers and volumes. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up all containers and volumes..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans
        print_info "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

prune_docker() {
    print_warning "This will remove unused Docker resources. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Pruning Docker system..."
        docker system prune -f
        docker volume prune -f
        print_info "Docker system pruned!"
    else
        print_info "Prune cancelled."
    fi
}

# Main script logic
case "$1" in
    dev)
        dev_start
        ;;
    dev-build)
        dev_build
        ;;
    dev-stop)
        dev_stop
        ;;
    dev-logs)
        dev_logs "$@"
        ;;
    prod)
        prod_start
        ;;
    prod-build)
        prod_build
        ;;
    prod-stop)
        prod_stop
        ;;
    prod-logs)
        prod_logs "$@"
        ;;
    clean)
        clean_all
        ;;
    prune)
        prune_docker
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
