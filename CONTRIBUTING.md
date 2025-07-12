# Contributing to Mermaid Diagram Generator

Thank you for your interest in contributing to the Mermaid Diagram Generator! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git
- Basic knowledge of React, TypeScript, and Mermaid

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mermaiddg.git
   cd mermaiddg
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   pnpm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5173`

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing, avoid `any`
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add JSDoc comments for complex functions
- **Formatting**: Code is auto-formatted with Prettier

### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Define props with clear types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### File Organization
- **Components**: `/src/components/`
- **Types**: `/src/types/`
- **Data**: `/src/data/`
- **Utils**: `/src/utils/`
- **Tests**: `__tests__/` or `.test.ts` files

## 🔧 Making Changes

### Branch Naming
- **Features**: `feature/description`
- **Bug Fixes**: `fix/description`
- **Documentation**: `docs/description`
- **Refactoring**: `refactor/description`

### Commit Messages
Follow conventional commits:
```
type(scope): description

feat(canvas): add zoom controls
fix(renderer): resolve mermaid rendering issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Write clean, tested code
   - Update documentation if needed
   - Add tests for new features

3. **Test Your Changes**
   ```bash
   pnpm run lint
   pnpm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   ```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { DiagramNode } from '../DiagramNode';

describe('DiagramNode', () => {
  it('renders diagram content', () => {
    const mockNode = {
      id: '1',
      code: 'graph TD\nA --> B',
      title: 'Test Diagram'
    };
    
    render(<DiagramNode node={mockNode} />);
    expect(screen.getByText('Test Diagram')).toBeInTheDocument();
  });
});
```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Include examples in complex functions
- Document component props and interfaces

### README Updates
- Update feature lists for new functionality
- Add usage examples for new features
- Update installation instructions if needed

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Reproduce the bug
3. Test with latest version

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other solutions considered
```

## 🔍 Code Review

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

### Review Process
1. **Automated Checks**: CI/CD runs tests and linting
2. **Peer Review**: At least one maintainer reviews
3. **Testing**: Manual testing of new features
4. **Approval**: Maintainer approval required for merge

## 🏗️ Architecture

### Component Hierarchy
```
App
├── Canvas (main diagram workspace)
│   └── DiagramNode (individual diagrams)
│       └── DiagramRenderer (mermaid rendering)
├── Toolbar (main controls)
├── Sidebar (diagram management)
└── Modals (editing, export, etc.)
```

### State Management
- **Local State**: Component-specific state with useState
- **Shared State**: Props drilling for simple cases
- **Persistence**: localStorage for diagram data
- **Future**: Consider Zustand or Redux for complex state

### Data Flow
1. User interaction triggers event
2. Event handler updates state
3. State change triggers re-render
4. Changes persist to localStorage

## 🚀 Release Process

### Version Numbering
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Build and test
5. Deploy to production

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (if available)

### Maintainers
- Primary maintainer: [Your Name]
- Code reviewers: [List of reviewers]

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make Mermaid Diagram Generator better! 🎉
