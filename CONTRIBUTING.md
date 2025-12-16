# Contributing to Keystore

Thanks for your interest in contributing to Keystore! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with details
- **Feature Requests**: Have an idea? Share it in discussions
- **Code**: Submit PRs for bug fixes or new features
- **Documentation**: Improve docs, add examples
- **Testing**: Test on different devices and report results
- **Design**: Improve UI/UX

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/keystore.git
cd keystore
```

### 2. Install Dependencies

```bash
# Root dependencies (Anchor)
npm install

# Frontend dependencies
cd app
npm install
```

### 3. Build and Test

```bash
# Build Solana program
anchor build

# Run tests
anchor test

# Start frontend
cd app
npm run dev
```

## 📋 Development Guidelines

### Code Style

**Rust (Solana Program)**:
- Follow Rust naming conventions
- Use `cargo fmt` before committing
- Add comments for complex logic
- Write unit tests for new features

**TypeScript (Frontend)**:
- Use TypeScript for all new code
- Follow existing code style
- Use functional components with hooks
- Add JSDoc comments for functions

**General**:
- Keep functions small and focused
- Write descriptive variable names
- Add comments for "why", not "what"
- Update tests when changing behavior

### Commit Messages

Use conventional commits format:

```
feat: add support for hardware wallets
fix: correct signature verification logic
docs: update deployment guide
test: add tests for multi-sig
refactor: simplify PDA derivation
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

### Branch Naming

```
feature/add-token-support
bugfix/signature-verification
docs/deployment-guide
```

## 🧪 Testing

### Test Checklist

- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Tested on multiple browsers
- [ ] Tested with different authenticators
- [ ] No TypeScript errors
- [ ] No Rust warnings
- [ ] Documentation updated

### Testing on Devnet

```bash
# Deploy your changes to devnet
anchor deploy --provider.cluster devnet

# Test with the frontend
cd app
NEXT_PUBLIC_PROGRAM_ID=your_test_program npm run dev
```

## 📝 Pull Request Process

1. **Create an Issue First**
   - Discuss the change before coding
   - Get feedback on approach
   - Avoid duplicate work

2. **Work on Your Branch**
   - Create feature branch from `main`
   - Make changes with clear commits
   - Keep changes focused

3. **Test Thoroughly**
   - Run all tests
   - Test manually
   - Check edge cases

4. **Submit PR**
   - Fill out PR template
   - Reference related issues
   - Add screenshots if UI changes
   - Request review

5. **Address Feedback**
   - Respond to comments
   - Make requested changes
   - Re-request review

6. **Merge**
   - Maintainer will merge when approved
   - Delete your branch after merge

## 🏗️ Architecture Overview

```
keystore/
├── programs/keystore/    # Solana program (Rust/Anchor)
├── app/                 # Frontend (Next.js/React)
├── tests/               # Integration tests
└── docs/                # Documentation
```

### Key Files

- `programs/keystore/src/lib.rs` - Program entrypoint
- `programs/keystore/src/instructions/` - Instruction handlers
- `app/src/lib/passkey.ts` - WebAuthn integration
- `app/src/lib/keystore.ts` - Program client
- `app/src/app/page.tsx` - Main UI

## 🐛 Bug Reports

Include:
- **Description**: What happened?
- **Expected**: What should happen?
- **Steps**: How to reproduce?
- **Environment**: Browser, OS, device
- **Screenshots**: If applicable
- **Logs**: Console errors

## 💡 Feature Requests

Include:
- **Problem**: What problem does it solve?
- **Solution**: Proposed solution
- **Alternatives**: Other options considered
- **Use Case**: Real-world scenario

## 🔐 Security

**Found a security issue?**

DO NOT open a public issue. Email security@keystore.example.com instead.

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

## 📖 Documentation

Documentation improvements are always welcome!

### Types of Docs

- **README**: Getting started
- **ARCHITECTURE**: System design
- **DEPLOY**: Deployment guide
- **DEMO**: Presentation script
- **API**: Code documentation

### Writing Guidelines

- Use clear, simple language
- Include code examples
- Add diagrams when helpful
- Test all code samples
- Update table of contents

## 🎨 Design Contributions

UI/UX improvements welcome!

Include:
- Mockups or designs
- Explanation of changes
- User benefit
- Before/after comparisons

## 🌟 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in project updates

## 💬 Getting Help

- **Discord**: [Join our server](https://discord.gg/keystore)
- **Twitter**: [@KeystoreWallet](https://twitter.com/KeystoreWallet)
- **Email**: hello@keystore.example.com

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior**:
- Using welcoming language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community

**Unacceptable behavior**:
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unprofessional conduct

### Enforcement

Report violations to conduct@keystore.example.com. All complaints will be reviewed and investigated.

## 📄 License

By contributing, you agree your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make Keystore better. Whether it's code, docs, design, or feedback - thank you! 🎉

---

Questions? Open an issue or ask in Discord!

