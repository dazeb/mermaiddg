#!/bin/bash

# Build script for Mermaid Diagram Application
set -e

echo "🚀 Building Mermaid Diagram Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Build the application locally first
print_status "Building application locally..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
    pnpm run build
    print_success "Local build completed successfully!"
else
    print_warning "pnpm not found, skipping local build. Docker will handle the build."
fi

# Build Docker image
print_status "Building Docker image..."
docker build -t mermaid-diagram-app:latest .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully!"
else
    print_error "Docker build failed!"
    exit 1
fi

# Get image size
IMAGE_SIZE=$(docker images mermaid-diagram-app:latest --format "table {{.Size}}" | tail -n 1)
print_status "Docker image size: $IMAGE_SIZE"

# Optional: Run the container
read -p "Do you want to run the container now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting container..."
    docker run -d -p 3000:80 --name mermaid-app mermaid-diagram-app:latest
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully!"
        print_status "Application is available at: http://localhost:3000"
        print_status "Health check endpoint: http://localhost:3000/health"
        
        # Wait a moment and check if container is running
        sleep 3
        if docker ps | grep -q mermaid-app; then
            print_success "Container is running healthy!"
        else
            print_error "Container failed to start properly. Check logs with: docker logs mermaid-app"
        fi
    else
        print_error "Failed to start container!"
        exit 1
    fi
fi

print_success "Build process completed!"
echo
echo "📋 Available commands:"
echo "  • Start container:     docker run -d -p 3000:80 --name mermaid-app mermaid-diagram-app:latest"
echo "  • Stop container:      docker stop mermaid-app"
echo "  • Remove container:    docker rm mermaid-app"
echo "  • View logs:          docker logs mermaid-app"
echo "  • Use docker-compose: docker-compose up -d"
echo "  • Development mode:   docker-compose --profile dev up"
