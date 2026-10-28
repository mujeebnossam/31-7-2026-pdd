# 📱 Appium Mobile App Frontend E2E Testing

Automated mobile end-to-end functionality testing suite for the SpendWise AI Flutter mobile application built with **Appium 2.x** and **WebdriverIO**.

## 📑 Test Artifacts
- **Full Mobile Test Catalog (Displayable on GitHub):** [**View All 310 Mobile Test Cases in TEST_CASES.md**](./TEST_CASES.md)
- **Detailed Excel Report:** [**Download `appium-test-report.xlsx`**](./appium-test-report.xlsx) (Contains Executive Summary + Details sheets)
- **Test Script Source:** [`tests/app-login-tests.js`](./tests/app-login-tests.js)

## 🚀 How to Run Locally

```bash
# Run the 310 Appium Mobile E2E tests
node appium-tests/tests/app-login-tests.js

# Or via npm
npm run test:appium
```

## 📱 Capabilities Configured
- **Android:** `UiAutomator2` targeting Pixel 7 on Android 14 (API 34), package `com.spendwise.ai`.
- **iOS:** `XCUITest` targeting iPhone 15 Pro on iOS 17.2.
