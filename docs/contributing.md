# Contributing

Thank you for your interest in contributing to Learnify! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community for everyone.

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/Learnify.git
cd Learnify
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Making Changes

1. Write your code
2. Follow existing code style
3. Add tests if applicable
4. Update documentation if needed

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic

### Running Tests

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

### Committing Changes

Write clear, concise commit messages:

```bash
# Good
git commit -m "Add course search functionality"
git commit -m "Fix enrollment progress calculation"

# Bad
git commit -m "Update files"
git commit -m "Fix bug"
```

## Pull Request Process

### 1. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template

### 3. PR Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what and why
- **Screenshots**: Include for UI changes
- **Testing**: Describe how you tested

### 4. Review Process

- Maintainers will review your PR
- Address any feedback
- Once approved, your PR will be merged

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` for beginner-friendly tasks.

### Types of Contributions

- **Bug fixes** - Fix reported issues
- **Features** - Implement new functionality
- **Documentation** - Improve docs
- **Tests** - Add test coverage
- **Performance** - Optimize code
- **Accessibility** - Improve a11y

### Feature Requests

Before working on a large feature:

1. Check existing issues
2. Open a new issue to discuss
3. Wait for maintainer feedback

## Project Structure

```
learnify/
├── prisma/          # Database schema and seeds
├── docs/            # Documentation
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components
│   ├── lib/         # Utilities and configs
│   ├── hooks/       # Custom React hooks
│   ├── providers/   # Context providers
│   └── types/       # TypeScript types
└── public/          # Static assets
```

## Questions?

- Open an issue for questions
- Check existing issues and discussions
- Read the documentation

Thank you for contributing! 🎉
