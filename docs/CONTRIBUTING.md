# Contributing to EuroPath

## Ways to Contribute

### Data Updates (Most Needed!)
1. Check [DATA_SOURCES.md](DATA_SOURCES.md) for the official source
2. Open an issue with `data-correction` label, or submit a PR directly

### Bug Reports
Include: expected vs actual behavior, browser/device/OS, reproduction steps.

### Feature Requests
Open an issue with `enhancement` label.

### Code Contributions
```bash
git clone https://github.com/YOUR_USERNAME/europath.git
cd europath
git checkout -b feature/your-feature-name
# make changes
cd frontend && npm test
cd ../backend && npm test
git commit -m "feat: description"
git push origin feature/your-feature-name
```

## Commit Format
```
feat:     New feature
fix:      Bug fix
data:     Country data update
docs:     Documentation
style:    Formatting
refactor: Restructure
test:     Tests
chore:    Build, deps, CI
```

## PR Checklist
- [ ] Describe what changed and why
- [ ] For data changes, cite official source URL
- [ ] Tested locally
- [ ] No sensitive data committed

## Code Style
- JS/JSX: 2-space indent, single quotes, no semicolons
- Kotlin: official Kotlin conventions
- Python: PEP 8, 4-space indent

## License
By contributing, you agree your contributions are licensed under MIT.
