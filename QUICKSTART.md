# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Setup Environment

```bash
cd tests
cp .env.example .env
# Edit .env if needed to match your service URLs
```

### 2. Install Dependencies (Already Done!)

```bash
npm install  # Already completed with 424 packages
```

### 3. Start Services

Make sure all services are running:

```bash
# From the root of aioutlet project
npm run services:up
```

Or manually start:

- Auth Service (port 3001)
- User Service (port 3002)
- Message Broker (port 4000)
- Notification Service (port 3003)

### 4. Run Your First Tests

#### Smoke Tests (Fastest - 5 seconds)

```bash
npm run test:smoke
```

Expected output:

```
✅ Auth Service is healthy
✅ User Service is healthy
✅ Message Broker is healthy
✅ All services responded in Xms
✅ User registration works
✅ Input validation works
```

#### API Tests (Fast - 10 seconds)

```bash
npm run test:api
```

#### Integration Tests (Medium - 20 seconds)

```bash
npm run test:integration
```

#### E2E Tests (Slower - 60 seconds)

```bash
npm run test:e2e
```

### 5. Run Specific Service Tests

```bash
# Test only auth service
npm run test:api:auth

# Test only user service
npm run test:api:user

# Test only message broker
npm run test:api:message-broker
```

### 6. Watch Mode (for Development)

```bash
# Watch API tests - re-runs on file changes
npm run test:api:watch

# Watch integration tests
npm run test:integration:watch
```

## 📊 Test Structure at a Glance

```
tests/
├── smoke/           # Critical path (< 5s) - Run first!
├── api/             # Individual endpoints (< 10s) - Run often
├── integration/     # Service interactions (< 20s) - Run on PR
├── e2e/             # Full workflows (< 60s) - Run before deploy
└── performance/     # Load tests (minutes) - Run nightly
```

## 🎯 Common Commands

```bash
# Quick validation
npm run test:smoke

# Full CI pipeline
npm run test:ci

# Everything except performance
npm run test:all

# Including performance tests
npm run test:nightly

# With coverage
npm run test:coverage
```

## 🔍 Debugging Failed Tests

1. Check service health:

```bash
npm run services:status
```

2. View service logs:

```bash
npm run services:logs
```

3. Restart services:

```bash
npm run services:down
npm run services:up
```

## 📚 Next Steps

1. Read the full [README.md](README.md) for comprehensive documentation
2. Check [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for what was migrated
3. Explore shared helpers in `shared/helpers/` for reusable utilities
4. Review test fixtures in `shared/fixtures/` for test data generation

## 💡 Tips

- **Always run smoke tests first** - they validate services are ready
- **Use watch mode during development** - faster feedback loop
- **Check .env if tests fail** - ensure service URLs are correct
- **Clean up test data** - set `CLEANUP_AFTER_TESTS=true` in .env
- **Run sequentially if conflicts** - already configured in jest configs

## ⚡ Performance Notes

- Smoke tests: **< 5 seconds** (critical path only)
- API tests: **< 10 seconds** (can run in parallel)
- Integration tests: **< 20 seconds** (sequential execution)
- E2E tests: **< 60 seconds** (full workflows)

## 🆘 Troubleshooting

**Services not starting?**

```bash
npm run wait-for-services
```

**Port conflicts?**

- Check .env file and update service URLs

**Tests timing out?**

- Increase timeout in specific jest.config.\*.js file

**Random failures?**

- Run with `maxWorkers: 1` (already set for integration/e2e)
- Enable `CLEANUP_BETWEEN_TESTS=true` in .env

---

**Happy Testing! 🎉**

For detailed documentation, see [README.md](README.md)
