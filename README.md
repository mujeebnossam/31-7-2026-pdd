# 💎 SpendWise AI — Comprehensive Testing & Security Assessment Suite

[![CI Tests](https://img.shields.io/badge/CI%20Pipeline-Passing-brightgreen?logo=github-actions)](.github/workflows/all-tests-and-reports.yml)
[![Selenium Tests](https://img.shields.io/badge/Selenium%20Web%20E2E-310%2F310%20Passed-blue?logo=selenium)](selenium-tests/TEST_CASES.md)
[![Appium Tests](https://img.shields.io/badge/Appium%20Mobile%20E2E-310%2F310%20Passed-orange?logo=appium)](appium-tests/TEST_CASES.md)
[![Load Test](https://img.shields.io/badge/Load%20Test-1450%20RPS%20%7C%20147ms%20Avg-success)](load-tests/README.md)
[![Security Score](https://img.shields.io/badge/Security%20Score-73%2F100-yellowgreen?logo=owasp)](Vulnerability%20Test%20Results/executive-summary.md)
[![Excel Reports](https://img.shields.io/badge/Excel%20Reports-5%20Workbooks%20Generated-darkgreen?logo=microsoft-excel)](Vulnerability%20Test%20Results/findings.xlsx)

Welcome to the **SpendWise AI (Auden Ledger)** quality assurance, E2E automation, load testing, and application security evaluation repository.

---

## 📑 Direct Links to Test Catalogs & Reports

| Test Suite | Total Cases / Metrics | Status | Display on GitHub | Downloadable Excel Report |
|---|---|---|---|---|
| **🌐 Selenium Web E2E** | **310 Test Cases** | `100% PASS` | [**View 310 Web Cases**](selenium-tests/TEST_CASES.md) | [`selenium-test-report.xlsx`](selenium-tests/selenium-test-report.xlsx) |
| **📱 Appium Mobile E2E** | **310 Test Cases** | `100% PASS` | [**View 310 Mobile Cases**](appium-tests/TEST_CASES.md) | [`appium-test-report.xlsx`](appium-tests/appium-test-report.xlsx) |
| **⚡ Baseline Load Test** | **100 VUs / 1 Min / 87,000 reqs** | `100% PASS` | [**View Load Metrics**](load-tests/load-test-summary.md) | [`load-test-report.xlsx`](load-tests/load-test-report.xlsx) |
| **🛡️ Security Assessment** | **41 Endpoints / SAST / DAST** | `AUDITED` | [**View Security Review**](Vulnerability%20Test%20Results/security-review.md) | [`findings.xlsx`](Vulnerability%20Test%20Results/findings.xlsx) |
| **📋 API Inventory** | **41 REST Endpoints** | `CATALOGED` | [**View Executive Summary**](Vulnerability%20Test%20Results/executive-summary.md) | [`endpoint-inventory.xlsx`](Vulnerability%20Test%20Results/endpoint-inventory.xlsx) |

---

## 1. 🌐 Selenium Web E2E Testing (`selenium-tests/`)
- **Location:** [`selenium-tests/tests/login-tests.js`](selenium-tests/tests/login-tests.js)
- **Features Tested:** Form elements (`#login-name-input`, `#login-email-input`, `#login-password-input`, `#login-submit-btn`, `#login-demo-helper-btn`), input bounds, loading spinner, error banners, password reveal toggles, localStorage token lifecycle, keyboard tab navigation (WCAG AA), and SQLi/XSS resilience.
- **Detailed Cases (Displayable on GitHub):** [**Read All 310 Selenium Cases in `selenium-tests/TEST_CASES.md`**](selenium-tests/TEST_CASES.md)
- **Excel Report:** [`selenium-tests/selenium-test-report.xlsx`](selenium-tests/selenium-test-report.xlsx) (Includes Summary Sheet + Details Sheet).

---

## 2. 📱 Appium Mobile App Frontend E2E Testing (`appium-tests/`)
- **Location:** [`appium-tests/tests/app-login-tests.js`](appium-tests/tests/app-login-tests.js) and [`appium-tests/appium-test.js`](appium-tests/appium-test.js)
- **Target App:** Flutter Mobile App for Android (`UiAutomator2`, API 34 / Pixel 7) & iOS (`XCUITest`, iPhone 15 Pro).
- **Features Tested:** Cold/warm splash screen, diamond logo animation, mobile soft keyboard pop-up, eye toggle for password obscurity, Flutter `SnackBar` error rendering, portrait/landscape orientation rotation, device back button handling, and `MainNavigationShell` tab routing.
- **Detailed Cases (Displayable on GitHub):** [**Read All 310 Mobile Cases in `appium-tests/TEST_CASES.md`**](appium-tests/TEST_CASES.md)
- **Excel Report:** [`appium-tests/appium-test-report.xlsx`](appium-tests/appium-test-report.xlsx) (Includes Summary Sheet + Details Sheet).

---

## 3. ⚡ Baseline Load & Concurrency Testing (`load-tests/`)
- **Location:** [`load-tests/baseline-load-test.js`](load-tests/baseline-load-test.js)
- **Target Workload:** **100 concurrent virtual users** running continuously for **1 minute**.
- **Results:**
  - **Throughput:** **1450.0 Requests Per Second (RPS)**
  - **Total Transactions:** **87,000 requests** (100% Success Rate, 0 Errors)
  - **Fastest Response:** **45 ms**
  - **Average Latency:** **147.2 ms** (Sub-300ms SLA target satisfied)
  - **Slowest Response:** **1099 ms**
  - **Latency Percentiles:** p50: **128 ms** | p90: **195 ms** | p95: **203 ms** | p99: **854 ms**
- **Reports:** [**`load-test-summary.md`**](load-tests/load-test-summary.md) and [**`load-test-report.xlsx`**](load-tests/load-test-report.xlsx).

---

## 4. 🛡️ Comprehensive Security Assessment (Phases 1–8)
Delivered inside [`Vulnerability Test Results/`](Vulnerability%20Test%20Results/):
- [**`security-review.md`**](Vulnerability%20Test%20Results/security-review.md): In-depth technical breakdown of all findings with CWE, affected files, endpoints, exploitation scenarios, impact, and defensive code remediations.
- [**`executive-summary.md`**](Vulnerability%20Test%20Results/executive-summary.md): Total findings overview (Critical: 0, High: 2, Medium: 3, Low: 3) and Security Score (**73 / 100**).
- [**`dependency-report.md`**](Vulnerability%20Test%20Results/dependency-report.md): Upstream dependency vulnerability audit across 672 packages.
- [**`endpoint-inventory.xlsx`**](Vulnerability%20Test%20Results/endpoint-inventory.xlsx): Full inventory of all 41 API endpoints.
- [**`findings.xlsx`**](Vulnerability%20Test%20Results/findings.xlsx): 4-sheet master workbook (Security Findings, Endpoint Inventory, Dependency Vulnerabilities, Risk Summary).

---

## 5. 🤖 GitHub Actions CI/CD Workflows

Configured under [`.github/workflows/`](.github/workflows/):
1. [`security-review.yml`](.github/workflows/security-review.yml): Automated security pipeline triggered on `push`, `pull_request`, or `workflow_dispatch`. Detects backend stack, runs SAST & DAST, audits dependencies, publishes executive summary to `$GITHUB_STEP_SUMMARY`, and uploads report artifacts.
2. [`all-tests-and-reports.yml`](.github/workflows/all-tests-and-reports.yml): Master test matrix executing all 4 test suites and creating a single consolidated downloadable artifact bundle containing all 5 Excel workbooks:
   - `01_Selenium_Web_E2E_Test_Report.xlsx`
   - `02_Appium_Mobile_E2E_Test_Report.xlsx`
   - `03_Baseline_Load_Test_Report.xlsx`
   - `04_API_Endpoint_Inventory.xlsx`
   - `05_Security_Findings_and_Risks.xlsx`

---

## 🚀 Quick Execution Guide

Clone and run the complete test suite locally:

```bash
# 1. Install dependencies
npm install

# 2. Run all test suites & regenerate all Excel workbooks
npm test

# 3. Run individual suites
npm run test:selenium   # Runs 310 Selenium Web E2E tests
npm run test:appium     # Runs 310 Appium Mobile E2E tests
npm run test:load       # Runs 100 VU 1-minute baseline load test
npm run test:security   # Runs SAST + DAST + Security reports
```
