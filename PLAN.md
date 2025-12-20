# PLAN.md

## Completed

- [x] Set up TypeScript project structure with tsup bundler
- [x] Create package.json with proper NPM configuration
- [x] Convert SDK to TypeScript with full type definitions
- [x] Create GitHub Actions CI/CD workflows
- [x] Initialize git repository

## Next Steps

### 1. Install Dependencies and Test Build
```bash
npm install
npm run build
```

### 2. Run Type Checking
```bash
npm run typecheck
```

### 3. Test Against Real BigCommerce Store
- Use the demo endpoint to verify SDK functionality
- Test product search, cart operations, checkout flow

### 4. Create GitHub Repository
```bash
gh repo create runtypelabs/runtype-bc-graphql-sdk --private
git push -u origin main
```

### 5. Configure NPM Publishing
- Add `NPM_TOKEN` secret to GitHub repository settings
- Create a GitHub release to trigger NPM publish

### 6. Future Improvements
- Add comprehensive test suite with Vitest
- Add retry logic for failed requests
- Add request caching layer
- Consider adding WebSocket support for real-time cart updates
