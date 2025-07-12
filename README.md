# 🧜‍♀️ Mermaid Diagram Generator

A modern, interactive web application for creating, editing, and managing Mermaid diagrams with a clean, intuitive interface. Built with React, TypeScript, and optimized for performance with advanced bundle splitting and Docker deployment.

![Mermaid Diagram Generator](https://img.shields.io/badge/Mermaid-Diagram%20Generator-blue?style=for-the-badge&logo=mermaid)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)

## ✨ Features

### 🎨 **Interactive Canvas**

- **Drag & Drop Interface**: Intuitive diagram placement and movement
- **Zoom & Pan**: Smooth navigation with mouse wheel and drag controls
- **Grid-Free Design**: Clean, distraction-free workspace
- **Real-time Rendering**: Instant Mermaid diagram visualization

### 📝 **Diagram Management**

- **Multiple Diagram Types**: Support for all Mermaid diagram types
- **Live Preview**: Real-time editing with instant feedback
- **Template Library**: Pre-built templates for common diagram patterns
- **Persistent Storage**: Automatic saving to localStorage
- **Export Options**: PNG, SVG, and code export functionality

### 🛠️ **Advanced Editing**

- **Code Editor**: Syntax-highlighted Mermaid code editing
- **Dialog-based Editing**: Clean modal interface for diagram modification
- **Duplicate & Clone**: Easy diagram replication
- **Undo/Redo**: Full editing history support
- **Keyboard Shortcuts**: Efficient workflow with hotkeys

### 🚀 **Performance Optimized**

- **Bundle Splitting**: Optimized loading with vendor chunks
- **Lazy Loading**: On-demand component loading
- **97% Bundle Size Reduction**: From 684kB to 22kB initial load
- **Gzip Compression**: Efficient asset delivery

### 🐳 **Production Ready**

- **Docker Support**: Multi-stage builds for production deployment
- **Nginx Configuration**: Optimized serving with security headers
- **Health Checks**: Built-in monitoring endpoints
- **Development Environment**: Hot-reload development setup

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Docker** (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd mermaiddg

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open browser to http://localhost:5173
```

### Production Build

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Docker Deployment

#### Quick Start with Docker

```bash
# Using the automated build script
./build.sh

# Or manually
docker build -t mermaid-diagram-app:latest .
docker run -d -p 3000:80 --name mermaid-app mermaid-diagram-app:latest
```

#### Docker Compose

```bash
# Production deployment
docker-compose up -d

# Development environment
docker-compose --profile dev up
```

## 📁 Project Structure

```
mermaiddg/
├── src/
│   ├── components/          # React components
│   │   ├── Canvas.tsx       # Main diagram canvas
│   │   ├── DiagramNode.tsx  # Individual diagram nodes
│   │   ├── DiagramRenderer.tsx # Mermaid rendering engine
│   │   ├── Sidebar.tsx      # Diagram management sidebar
│   │   ├── Toolbar.tsx      # Main toolbar
│   │   ├── CodeEditor.tsx   # Code editing modal
│   │   ├── ExportModal.tsx  # Export functionality
│   │   └── DiagramEditDialog.tsx # Diagram editing dialog
│   ├── data/
│   │   └── templates.ts     # Diagram templates
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── App.tsx              # Main application component
├── public/                  # Static assets
├── docker/                  # Docker configuration
│   ├── Dockerfile           # Production build
│   ├── Dockerfile.dev       # Development build
│   ├── docker-compose.yml   # Orchestration
│   └── nginx.conf           # Nginx configuration
├── build.sh                 # Automated build script
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🎯 Core Technologies

### Frontend Stack

- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Diagram Engine

- **Mermaid 11.8.1** - Advanced diagram rendering
- **Custom Renderer** - Optimized Mermaid integration
- **Theme Support** - Customizable diagram appearance

### State Management

- **React Hooks** - Built-in state management
- **localStorage** - Client-side persistence
- **Supabase Ready** - Backend integration prepared

### Build & Deployment

- **Vite Build** - Optimized production builds
- **Bundle Splitting** - Vendor chunk separation
- **Docker** - Containerized deployment
- **Nginx** - Production web server

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vite Configuration

The project uses optimized Vite configuration with:

- **Manual Chunks**: Separate vendor bundles for better caching
- **Bundle Analysis**: Size optimization and warnings
- **Development Optimizations**: Fast HMR and dependency handling

### Docker Configuration

- **Multi-stage Build**: Optimized production images
- **Security Headers**: XSS protection and security policies
- **Health Checks**: Application monitoring
- **Gzip Compression**: Efficient asset delivery

## 📊 Performance Metrics

### Bundle Optimization Results

- **Initial Bundle**: 684.75 kB → 22.23 kB (97% reduction)
- **React Vendor**: 140.97 kB (cached separately)
- **Mermaid Vendor**: 529.94 kB (cached separately)
- **UI Vendor**: 10.26 kB (icons and UI components)
- **Utils Vendor**: 0.92 kB (utilities and helpers)

### Docker Image

- **Final Image Size**: ~58 MB (nginx alpine + assets)
- **Build Time**: ~20 seconds
- **Startup Time**: ~2-3 seconds

## 🎨 Usage Guide

### Creating Diagrams

1. **Add New Diagram**: Click the "+" tool in the toolbar
2. **Click on Canvas**: Place diagram anywhere on the canvas
3. **Edit Content**: Double-click diagram or use edit button
4. **Customize**: Modify Mermaid code in the editor
5. **Save**: Changes auto-save to localStorage

### Diagram Types Supported

- **Flowcharts** - Decision trees and process flows
- **Sequence Diagrams** - Interaction timelines
- **Class Diagrams** - Object-oriented structures
- **State Diagrams** - State machine representations
- **Entity Relationship** - Database schemas
- **User Journey** - User experience flows
- **Gantt Charts** - Project timelines
- **Pie Charts** - Data visualization
- **Git Graphs** - Version control flows

### Keyboard Shortcuts

- **Delete**: Remove selected diagram
- **Ctrl+D**: Duplicate selected diagram
- **Mouse Wheel**: Zoom in/out
- **Drag**: Pan canvas or move diagrams
- **Double-click**: Edit diagram

### Export Options

- **PNG Export**: High-quality raster images
- **SVG Export**: Scalable vector graphics
- **Code Export**: Raw Mermaid syntax
- **Bulk Export**: Multiple diagrams at once

## 🔒 Security Features

### Application Security

- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Secure request handling
- **Input Sanitization**: Safe Mermaid code processing
- **No Inline Scripts**: CSP-compliant architecture

### Docker Security

- **Non-root User**: Container runs as nginx user
- **Minimal Attack Surface**: Alpine Linux base
- **Security Headers**: Comprehensive HTTP security
- **Health Monitoring**: Application status checks

## 🚀 Deployment Options

### Local Development

```bash
pnpm run dev
```

### Production Build

```bash
pnpm run build
pnpm run preview
```

### Docker Production

```bash
docker build -t mermaid-app .
docker run -p 3000:80 mermaid-app
```

### Docker Compose

```bash
docker-compose up -d
```

### Cloud Deployment

The application is ready for deployment on:

- **Vercel** - Static hosting with edge functions
- **Netlify** - JAMstack deployment
- **AWS** - Container or static hosting
- **Google Cloud** - Cloud Run or App Engine
- **Azure** - Container Instances or Static Web Apps

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint

# Docker
./build.sh            # Automated Docker build
docker-compose up     # Start with Docker Compose
```

### Code Quality

- **ESLint** - Code linting and formatting
- **TypeScript** - Type checking and safety
- **Prettier** - Code formatting (configured)
- **Git Hooks** - Pre-commit quality checks

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- **[Docker Deployment Guide](DOCKER.md)** - Comprehensive Docker setup
- **[API Documentation](docs/api.md)** - Backend integration guide
- **[Component Guide](docs/components.md)** - Component documentation
- **[Mermaid Syntax](https://mermaid.js.org/)** - Official Mermaid documentation

## 🐛 Troubleshooting

### Common Issues

**Diagrams not rendering:**

- Check browser console for errors
- Verify Mermaid syntax is valid
- Clear localStorage and refresh

**Build failures:**

- Clear node_modules and reinstall
- Check Node.js version (18+ required)
- Verify pnpm installation

**Docker issues:**

- Ensure Docker is running
- Check port availability
- Review container logs

### Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Community support on GitHub Discussions
- **Documentation**: Check the docs/ directory
- **Mermaid Help**: Official Mermaid documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mermaid.js** - Powerful diagramming library
- **React Team** - Amazing frontend framework
- **Vite Team** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

---

**Built with ❤️ for the developer community**

_Create beautiful diagrams with ease and deploy anywhere with confidence._
