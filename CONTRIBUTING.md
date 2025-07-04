# Contributing to Hedera Counter DApp

Thank you for your interest in contributing to the Hedera Counter DApp! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if the issue already exists
2. Use the issue templates when available
3. Provide detailed information about the problem
4. Include steps to reproduce the issue

### Suggesting Features

We welcome feature suggestions! Please:
1. Check if the feature has already been requested
2. Explain the use case and benefits
3. Consider the scope and complexity
4. Be open to discussion and feedback

### Code Contributions

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/hedera-counter-dapp.git
   cd hedera-counter-dapp
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run test-contract
   npm run compile-contract
   cd frontend && npm run build
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### Smart Contract Development

- Use Solidity 0.8.19 or compatible version
- Follow OpenZeppelin patterns for security
- Include comprehensive NatSpec documentation
- Write unit tests for all functions
- Use meaningful variable and function names
- Implement proper error handling

Example:
```solidity
/**
 * @dev Increments the counter by a specified amount
 * @param amount The amount to increment by
 * @notice Can only be called when contract is not paused
 */
function incrementBy(uint256 amount) external whenNotPaused {
    if (_count + amount > MAX_COUNT) revert MaxCountExceeded();
    
    _count += amount;
    emit CountIncremented(_count, msg.sender);
}
```

### Frontend Development

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful component documentation
- Use semantic HTML and accessibility features

Example:
```typescript
interface CounterDisplayProps {
  count: number;
  isLoading?: boolean;
  maxCount?: number;
  minCount?: number;
}

export const CounterDisplay: React.FC<CounterDisplayProps> = ({
  count,
  isLoading = false,
  maxCount = 1000000,
  minCount = 0,
}) => {
  // Component implementation
};
```

### Documentation

- Use clear, concise language
- Include code examples
- Update README.md for significant changes
- Add inline comments for complex logic
- Use proper markdown formatting

## 🧪 Testing Guidelines

### Smart Contract Tests

- Test all public functions
- Include edge cases and error conditions
- Test access control mechanisms
- Verify event emissions
- Use descriptive test names

```javascript
describe("Counter Contract", function () {
  it("Should increment the counter correctly", async function () {
    await counter.increment();
    expect(await counter.getCount()).to.equal(1);
  });

  it("Should revert when incrementing beyond maximum", async function () {
    // Setup counter at max value
    await expect(counter.increment())
      .to.be.revertedWithCustomError(counter, "MaxCountExceeded");
  });
});
```

### Frontend Tests

- Test component rendering
- Test user interactions
- Mock external dependencies
- Test error states
- Use React Testing Library

## 🔄 Pull Request Process

1. **PR Title**: Use conventional commit format
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for tests
   - `refactor:` for code refactoring

2. **PR Description**: Include
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes

3. **Review Process**
   - All PRs require at least one review
   - Address feedback promptly
   - Keep PRs focused and reasonably sized
   - Ensure CI checks pass

4. **Merge Requirements**
   - All tests must pass
   - Code coverage maintained
   - Documentation updated
   - No merge conflicts

## 🏗️ Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Hedera testnet account
- HashPack wallet (for testing)

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/hedera-counter-dapp.git
   cd hedera-counter-dapp
   npm install
   npm run setup
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   cp frontend/.env.local.example frontend/.env.local
   # Edit with your credentials
   ```

3. **Start Development**
   ```bash
   # Terminal 1: Smart contract development
   cd smart-contract
   npm run compile
   npm run test

   # Terminal 2: Frontend development
   cd frontend
   npm run dev
   ```

## 🎯 Areas for Contribution

### High Priority
- Additional wallet integrations
- Mobile responsiveness improvements
- Performance optimizations
- Security enhancements
- Test coverage improvements

### Medium Priority
- UI/UX enhancements
- Additional contract features
- Documentation improvements
- Internationalization (i18n)
- Analytics integration

### Low Priority
- Theme customization
- Advanced animations
- Additional deployment options
- Developer tools integration

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on

## 🔒 Security

### Reporting Security Issues

Please do not report security vulnerabilities through public GitHub issues. Instead:

1. Email security concerns to [security@yourproject.com]
2. Include detailed information about the vulnerability
3. Allow time for the issue to be addressed before public disclosure

### Security Best Practices

- Never commit private keys or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Follow smart contract security patterns
- Keep dependencies updated

## 📞 Getting Help

- **GitHub Discussions**: For general questions and discussions
- **Discord**: Join our community chat
- **Documentation**: Check the comprehensive docs
- **Stack Overflow**: Tag questions with `hedera` and `dapp`

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation
- Community highlights

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Hedera Counter DApp! Your efforts help make blockchain development more accessible to everyone. 🚀
