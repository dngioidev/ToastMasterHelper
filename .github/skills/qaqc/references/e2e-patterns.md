# E2E Testing Patterns (Playwright)

## Setup
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

## Page Object Model
```typescript
// e2e/pages/sessions.page.ts
export class SessionsPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/sessions/online'); }

  async clickNewSession() {
    await this.page.getByRole('button', { name: 'New Session' }).click();
  }

  async fillDate(date: string) {
    await this.page.getByLabel('Date').fill(date);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async sessionVisible(dateText: string) {
    return this.page.getByText(dateText).isVisible();
  }
}
```

## Test Templates

### Happy Path
```typescript
test('user can create an online session', async ({ page }) => {
  const sessionsPage = new SessionsPage(page);
  await sessionsPage.goto();
  await sessionsPage.clickNewSession();
  await sessionsPage.fillDate('2026-04-15');
  await sessionsPage.save();
  expect(await sessionsPage.sessionVisible('Apr 15, 2026')).toBe(true);
});
```

### Validation Error
```typescript
test('shows error when saving session without date', async ({ page }) => {
  const sessionsPage = new SessionsPage(page);
  await sessionsPage.goto();
  await sessionsPage.clickNewSession();
  await sessionsPage.save();
  await expect(page.getByRole('alert')).toContainText('Date is required');
});
```

### Business Rule Test
```typescript
test('prevents assigning evaluator with equal level to speaker', async ({ page }) => {
  // Setup: level 5 speaker already assigned
  // Try to assign level 5 evaluator
  await page.getByTestId('evaluator-select').selectOption('level-5-member');
  await expect(page.getByRole('alert')).toContainText('higher project level');
});
```

## Running E2E Tests
```bash
# Start Docker stack first
docker compose up -d

# Run all E2E tests
npx playwright test

# Run specific spec
npx playwright test e2e/sessions.spec.ts

# Interactive UI mode
npx playwright test --ui

# Debug a test
npx playwright test --debug e2e/sessions.spec.ts
```

## Test Data Strategy
- Use API calls in `test.beforeEach` to seed required data
- Clean up created data in `test.afterEach`
- Use a dedicated test database (configured in `.env.test`)
