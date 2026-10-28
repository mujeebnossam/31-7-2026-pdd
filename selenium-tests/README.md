# 🌐 Selenium E2E Web Frontend Testing

Automated end-to-end functionality testing suite for the SpendWise AI web application frontend built with **Selenium WebDriver**.

## 📑 Test Artifacts
- **Full Test Catalog (Displayable on GitHub):** [**View All 310 Test Cases in TEST_CASES.md**](./TEST_CASES.md)
- **Detailed Excel Report:** [**Download `selenium-test-report.xlsx`**](./selenium-test-report.xlsx) (Contains Executive Summary + Details sheets)
- **Test Script Source:** [`tests/login-tests.js`](./tests/login-tests.js)

## 🚀 How to Run Locally

```bash
# Run the 310 Selenium Web E2E tests
node selenium-tests/tests/login-tests.js

# Or via npm
npm run test:selenium
```

## 🧪 Coverage Scope
1. **Form Validation:** Field boundary limits, required constraints, email format verification, whitespace sanitization.
2. **Authentication Flow:** Valid demo credentials unlock vault, invalid password rejections, case-insensitivity checks.
3. **Security & Injection Tolerance:** XSS payloads, SQL injection string neutralization, Unicode handling, buffer overflow strings.
4. **UI & Accessibility:** Keyboard tab order (WCAG AA), loading state spinners, masked password reveal toggles, responsive viewports.
