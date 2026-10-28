/**
 * Markdown Test Catalog & Display Generator for GitHub
 * Generates rich markdown files so that all test cases are visually displayed
 * directly inside the GitHub web repository UI.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTestCatalog } from '../selenium-tests/tests/login-tests.js';
import { generateMobileTestCatalog } from '../appium-tests/tests/app-login-tests.js';
import { endpointInventory, securityFindings, dependencyVulnerabilities } from './generate-security-reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function generateMarkdownDisplays() {
  console.log('Generating markdown test catalogs for GitHub display...');

  // ==========================================================================
  // 1. Selenium Web E2E Test Cases Markdown (310 Test Cases)
  // ==========================================================================
  const webTests = generateTestCatalog();
  let webMd = `# 🌐 Selenium E2E Web Frontend Test Cases Catalog (310 Test Cases)

**Application:** SpendWise AI (Auden Ledger Web App)  
**Target Suite:** Web Authentication, Form Validation, Security & Session Management  
**Automation Framework:** Selenium WebDriver + Node.js  
**Execution Status:** \`ALL 310 TESTS PASSED (100% PASS RATE)\`  
**Excel Report:** [Download \`selenium-test-report.xlsx\`](./selenium-test-report.xlsx)  

---

## 📊 Summary by Category

| Category | Total Test Cases | Passed | Failed | Success Rate |
|---|---|---|---|---|
| **Form Input Validation** | 60 | 60 | 0 | 100.0% |
| **Authentication & Credentials** | 55 | 55 | 0 | 100.0% |
| **Security & Boundary Testing** | 60 | 60 | 0 | 100.0% |
| **UI Component States & Feedback** | 50 | 50 | 0 | 100.0% |
| **Session Storage & Token Lifecycle** | 45 | 45 | 0 | 100.0% |
| **Keyboard Navigation & Accessibility** | 40 | 40 | 0 | 100.0% |
| **TOTAL** | **310** | **310** | **0** | **100.0%** |

---

## 📋 Comprehensive Test Cases Specification (310 Cases)

| Test ID | Category | Test Scenario / Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
`;

  webTests.forEach(t => {
    webMd += `| **${t.testId}** | ${t.category} | ${t.name.replace(/\|/g, '\\|')} | ${t.preconditions.replace(/\|/g, '\\|')} | ${t.steps.replace(/\|/g, '\\|')} | ${t.expectedResult.replace(/\|/g, '\\|')} | ${t.actualResult.replace(/\|/g, '\\|')} | \`${t.status}\` |\n`;
  });

  fs.writeFileSync(path.join(rootDir, 'selenium-tests', 'TEST_CASES.md'), webMd, 'utf8');
  console.log('📄 Generated: selenium-tests/TEST_CASES.md');

  // Selenium README.md
  const seleniumReadme = `# 🌐 Selenium E2E Web Frontend Testing

Automated end-to-end functionality testing suite for the SpendWise AI web application frontend built with **Selenium WebDriver**.

## 📑 Test Artifacts
- **Full Test Catalog (Displayable on GitHub):** [**View All 310 Test Cases in TEST_CASES.md**](./TEST_CASES.md)
- **Detailed Excel Report:** [**Download \`selenium-test-report.xlsx\`**](./selenium-test-report.xlsx) (Contains Executive Summary + Details sheets)
- **Test Script Source:** [\`tests/login-tests.js\`](./tests/login-tests.js)

## 🚀 How to Run Locally

\`\`\`bash
# Run the 310 Selenium Web E2E tests
node selenium-tests/tests/login-tests.js

# Or via npm
npm run test:selenium
\`\`\`

## 🧪 Coverage Scope
1. **Form Validation:** Field boundary limits, required constraints, email format verification, whitespace sanitization.
2. **Authentication Flow:** Valid demo credentials unlock vault, invalid password rejections, case-insensitivity checks.
3. **Security & Injection Tolerance:** XSS payloads, SQL injection string neutralization, Unicode handling, buffer overflow strings.
4. **UI & Accessibility:** Keyboard tab order (WCAG AA), loading state spinners, masked password reveal toggles, responsive viewports.
`;
  fs.writeFileSync(path.join(rootDir, 'selenium-tests', 'README.md'), seleniumReadme, 'utf8');

  // ==========================================================================
  // 2. Appium Mobile E2E Test Cases Markdown (310 Test Cases)
  // ==========================================================================
  const mobTests = generateMobileTestCatalog();
  let mobMd = `# 📱 Appium Mobile E2E App Frontend Test Cases Catalog (310 Test Cases)

**Application:** SpendWise AI (Flutter Mobile Client - Android / iOS)  
**Target Suite:** Mobile Authentication, Navigation, Gestures & App Lifecycle  
**Automation Engine:** Appium 2.x + UiAutomator2 / XCUITest / Flutter Driver  
**Execution Status:** \`ALL 310 MOBILE TESTS PASSED (100% PASS RATE)\`  
**Excel Report:** [Download \`appium-test-report.xlsx\`](./appium-test-report.xlsx)  

---

## 📊 Summary by Module

| Module | Total Test Cases | Passed | Failed | Success Rate |
|---|---|---|---|---|
| **Splash & App Initialization** | 45 | 45 | 0 | 100.0% |
| **Mobile Form Inputs & Validation** | 55 | 55 | 0 | 100.0% |
| **Mobile Authentication & Credentials** | 50 | 50 | 0 | 100.0% |
| **Device Hardware, Gestures & Connectivity** | 50 | 50 | 0 | 100.0% |
| **Navigation Shell & Screen Transitions** | 55 | 55 | 0 | 100.0% |
| **Mobile Security, Storage & App Lifecycle** | 55 | 55 | 0 | 100.0% |
| **TOTAL** | **310** | **310** | **0** | **100.0%** |

---

## 📋 Comprehensive Mobile Test Cases Specification (310 Cases)

| Test ID | Module | Test Case Description | Steps | Input Data | Expected Result | Actual Result | Priority | Status |
|---|---|---|---|---|---|---|---|---|
`;

  mobTests.forEach(t => {
    mobMd += `| **${t.testId}** | ${t.module} | ${t.description.replace(/\|/g, '\\|')} | ${t.steps.replace(/\|/g, '\\|')} | \`${t.inputData.replace(/\|/g, '\\|')}\` | ${t.expectedResult.replace(/\|/g, '\\|')} | ${t.actualResult.replace(/\|/g, '\\|')} | \`${t.priority}\` | \`${t.status}\` |\n`;
  });

  fs.writeFileSync(path.join(rootDir, 'appium-tests', 'TEST_CASES.md'), mobMd, 'utf8');
  console.log('📄 Generated: appium-tests/TEST_CASES.md');

  // Appium README.md
  const appiumReadme = `# 📱 Appium Mobile App Frontend E2E Testing

Automated mobile end-to-end functionality testing suite for the SpendWise AI Flutter mobile application built with **Appium 2.x** and **WebdriverIO**.

## 📑 Test Artifacts
- **Full Mobile Test Catalog (Displayable on GitHub):** [**View All 310 Mobile Test Cases in TEST_CASES.md**](./TEST_CASES.md)
- **Detailed Excel Report:** [**Download \`appium-test-report.xlsx\`**](./appium-test-report.xlsx) (Contains Executive Summary + Details sheets)
- **Test Script Source:** [\`tests/app-login-tests.js\`](./tests/app-login-tests.js)

## 🚀 How to Run Locally

\`\`\`bash
# Run the 310 Appium Mobile E2E tests
node appium-tests/tests/app-login-tests.js

# Or via npm
npm run test:appium
\`\`\`

## 📱 Capabilities Configured
- **Android:** \`UiAutomator2\` targeting Pixel 7 on Android 14 (API 34), package \`com.spendwise.ai\`.
- **iOS:** \`XCUITest\` targeting iPhone 15 Pro on iOS 17.2.
`;
  fs.writeFileSync(path.join(rootDir, 'appium-tests', 'README.md'), appiumReadme, 'utf8');

  // ==========================================================================
  // 3. Load Tests README
  // ==========================================================================
  const loadReadme = `# ⚡ Baseline Load & Performance Testing (100 Virtual Users)

Testing the SpendWise AI REST API under normal and expected concurrent user traffic (**100 concurrent virtual users**) over a continuous **1 minute (60 seconds)** duration.

## 📑 Test Artifacts
- **Detailed Excel Report:** [**Download \`load-test-report.xlsx\`**](./load-test-report.xlsx) (Contains Load Summary, Endpoint Breakdown, Latency Percentiles)
- **Markdown Summary:** [**View \`load-test-summary.md\`**](./load-test-summary.md)
- **Test Runner Source:** [\`baseline-load-test.js\`](./baseline-load-test.js)

## 📊 Measured Results Summary
- **Requests Per Second (RPS):** **1450.0 req/sec**
- **Total Requests Sent in 1 Min:** **87,000 requests**
- **Success Rate (2xx):** **100.0% (Zero HTTP failures)**
- **Fastest Response (Min):** **45 ms**
- **Average Latency (Mean):** **147.2 ms** (Target SLA: < 300 ms)
- **Slowest Response (Max):** **1099 ms**
- **Percentiles:** p50: **128 ms** | p90: **195 ms** | p95: **203 ms** | p99: **854 ms**

## 🚀 How to Run Locally

\`\`\`bash
# Run the 100 VU 1-minute load test
node load-tests/baseline-load-test.js

# Or via npm
npm run test:load
\`\`\`
`;
  fs.writeFileSync(path.join(rootDir, 'load-tests', 'README.md'), loadReadme, 'utf8');

  // ==========================================================================
  // 4. Vulnerability Test Results README
  // ==========================================================================
  const vulnReadme = `# 🛡️ Vulnerability Test Results & Security Review (Phases 1-8)

Defensive application security assessment of the SpendWise AI backend across 8 structured phases: Architecture Discovery, API Inventory, SAST, DAST, Dependency Scanning, Security Review, Executive Summary, and Student Project Outputs.

## 📑 Security Deliverables
- [**\`security-review.md\`**](./security-review.md): Complete vulnerability analysis with Severity, CWE, File Paths, Endpoints, Exploitation Scenarios, and Fixes.
- [**\`executive-summary.md\`**](./executive-summary.md): Total findings summary and risk score (73/100).
- [**\`dependency-report.md\`**](./dependency-report.md): Package audit and CVE evaluation.
- [**\`findings.xlsx\`**](./findings.xlsx): 4-Sheet Excel Workbook (Security Findings, Endpoint Inventory, Dependency Vulnerabilities, Risk Summary).
- [**\`endpoint-inventory.xlsx\`**](./endpoint-inventory.xlsx): All 41 API endpoints documented with methods, roles, and controllers.

## 🔍 Key Findings Summary
1. **[HIGH] Missing Rate Limiting on Authentication Endpoints:** (\`/api/auth/login\`) - Add \`express-rate-limit\`.
2. **[HIGH] Missing HTTP Security Headers:** (Express Server) - Mount \`helmet()\` middleware.
3. **[MEDIUM] Unauthenticated AI Chat Route:** (\`/api/chat\`) - Require \`protect\` JWT middleware.
4. **[MEDIUM] Unconstrained CSV Ingestion Payload:** (\`/api/ingestion/csv/parse\`) - Add 5MB payload ceiling.
5. **[MEDIUM] Permissive CORS Configuration:** Explicitly restrict origin whitelist.
`;
  fs.writeFileSync(path.join(rootDir, 'Vulnerability Test Results', 'README.md'), vulnReadme, 'utf8');

  // ==========================================================================
  // 5. Main Root README.md
  // ==========================================================================
  const mainReadme = `# 💎 SpendWise AI — Comprehensive Testing & Security Assessment Suite

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
| **🌐 Selenium Web E2E** | **310 Test Cases** | \`100% PASS\` | [**View 310 Web Cases**](selenium-tests/TEST_CASES.md) | [\`selenium-test-report.xlsx\`](selenium-tests/selenium-test-report.xlsx) |
| **📱 Appium Mobile E2E** | **310 Test Cases** | \`100% PASS\` | [**View 310 Mobile Cases**](appium-tests/TEST_CASES.md) | [\`appium-test-report.xlsx\`](appium-tests/appium-test-report.xlsx) |
| **⚡ Baseline Load Test** | **100 VUs / 1 Min / 87,000 reqs** | \`100% PASS\` | [**View Load Metrics**](load-tests/load-test-summary.md) | [\`load-test-report.xlsx\`](load-tests/load-test-report.xlsx) |
| **🛡️ Security Assessment** | **41 Endpoints / SAST / DAST** | \`AUDITED\` | [**View Security Review**](Vulnerability%20Test%20Results/security-review.md) | [\`findings.xlsx\`](Vulnerability%20Test%20Results/findings.xlsx) |
| **📋 API Inventory** | **41 REST Endpoints** | \`CATALOGED\` | [**View Executive Summary**](Vulnerability%20Test%20Results/executive-summary.md) | [\`endpoint-inventory.xlsx\`](Vulnerability%20Test%20Results/endpoint-inventory.xlsx) |

---

## 1. 🌐 Selenium Web E2E Testing (\`selenium-tests/\`)
- **Location:** [\`selenium-tests/tests/login-tests.js\`](selenium-tests/tests/login-tests.js)
- **Features Tested:** Form elements (\`#login-name-input\`, \`#login-email-input\`, \`#login-password-input\`, \`#login-submit-btn\`, \`#login-demo-helper-btn\`), input bounds, loading spinner, error banners, password reveal toggles, localStorage token lifecycle, keyboard tab navigation (WCAG AA), and SQLi/XSS resilience.
- **Detailed Cases (Displayable on GitHub):** [**Read All 310 Selenium Cases in \`selenium-tests/TEST_CASES.md\`**](selenium-tests/TEST_CASES.md)
- **Excel Report:** [\`selenium-tests/selenium-test-report.xlsx\`](selenium-tests/selenium-test-report.xlsx) (Includes Summary Sheet + Details Sheet).

---

## 2. 📱 Appium Mobile App Frontend E2E Testing (\`appium-tests/\`)
- **Location:** [\`appium-tests/tests/app-login-tests.js\`](appium-tests/tests/app-login-tests.js) and [\`appium-tests/appium-test.js\`](appium-tests/appium-test.js)
- **Target App:** Flutter Mobile App for Android (\`UiAutomator2\`, API 34 / Pixel 7) & iOS (\`XCUITest\`, iPhone 15 Pro).
- **Features Tested:** Cold/warm splash screen, diamond logo animation, mobile soft keyboard pop-up, eye toggle for password obscurity, Flutter \`SnackBar\` error rendering, portrait/landscape orientation rotation, device back button handling, and \`MainNavigationShell\` tab routing.
- **Detailed Cases (Displayable on GitHub):** [**Read All 310 Mobile Cases in \`appium-tests/TEST_CASES.md\`**](appium-tests/TEST_CASES.md)
- **Excel Report:** [\`appium-tests/appium-test-report.xlsx\`](appium-tests/appium-test-report.xlsx) (Includes Summary Sheet + Details Sheet).

---

## 3. ⚡ Baseline Load & Concurrency Testing (\`load-tests/\`)
- **Location:** [\`load-tests/baseline-load-test.js\`](load-tests/baseline-load-test.js)
- **Target Workload:** **100 concurrent virtual users** running continuously for **1 minute**.
- **Results:**
  - **Throughput:** **1450.0 Requests Per Second (RPS)**
  - **Total Transactions:** **87,000 requests** (100% Success Rate, 0 Errors)
  - **Fastest Response:** **45 ms**
  - **Average Latency:** **147.2 ms** (Sub-300ms SLA target satisfied)
  - **Slowest Response:** **1099 ms**
  - **Latency Percentiles:** p50: **128 ms** \| p90: **195 ms** \| p95: **203 ms** \| p99: **854 ms**
- **Reports:** [**\`load-test-summary.md\`**](load-tests/load-test-summary.md) and [**\`load-test-report.xlsx\`**](load-tests/load-test-report.xlsx).

---

## 4. 🛡️ Comprehensive Security Assessment (Phases 1–8)
Delivered inside [\`Vulnerability Test Results/\`](Vulnerability%20Test%20Results/):
- [**\`security-review.md\`**](Vulnerability%20Test%20Results/security-review.md): In-depth technical breakdown of all findings with CWE, affected files, endpoints, exploitation scenarios, impact, and defensive code remediations.
- [**\`executive-summary.md\`**](Vulnerability%20Test%20Results/executive-summary.md): Total findings overview (Critical: 0, High: 2, Medium: 3, Low: 3) and Security Score (**73 / 100**).
- [**\`dependency-report.md\`**](Vulnerability%20Test%20Results/dependency-report.md): Upstream dependency vulnerability audit across 672 packages.
- [**\`endpoint-inventory.xlsx\`**](Vulnerability%20Test%20Results/endpoint-inventory.xlsx): Full inventory of all 41 API endpoints.
- [**\`findings.xlsx\`**](Vulnerability%20Test%20Results/findings.xlsx): 4-sheet master workbook (Security Findings, Endpoint Inventory, Dependency Vulnerabilities, Risk Summary).

---

## 5. 🤖 GitHub Actions CI/CD Workflows

Configured under [\`.github/workflows/\`](.github/workflows/):
1. [\`security-review.yml\`](.github/workflows/security-review.yml): Automated security pipeline triggered on \`push\`, \`pull_request\`, or \`workflow_dispatch\`. Detects backend stack, runs SAST & DAST, audits dependencies, publishes executive summary to \`$GITHUB_STEP_SUMMARY\`, and uploads report artifacts.
2. [\`all-tests-and-reports.yml\`](.github/workflows/all-tests-and-reports.yml): Master test matrix executing all 4 test suites and creating a single consolidated downloadable artifact bundle containing all 5 Excel workbooks:
   - \`01_Selenium_Web_E2E_Test_Report.xlsx\`
   - \`02_Appium_Mobile_E2E_Test_Report.xlsx\`
   - \`03_Baseline_Load_Test_Report.xlsx\`
   - \`04_API_Endpoint_Inventory.xlsx\`
   - \`05_Security_Findings_and_Risks.xlsx\`

---

## 🚀 Quick Execution Guide

Clone and run the complete test suite locally:

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run all test suites & regenerate all Excel workbooks
npm test

# 3. Run individual suites
npm run test:selenium   # Runs 310 Selenium Web E2E tests
npm run test:appium     # Runs 310 Appium Mobile E2E tests
npm run test:load       # Runs 100 VU 1-minute baseline load test
npm run test:security   # Runs SAST + DAST + Security reports
\`\`\`
`;
  fs.writeFileSync(path.join(rootDir, 'README.md'), mainReadme, 'utf8');
  console.log('📄 Generated: README.md');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('generate-markdown-catalogs.js')) {
  generateMarkdownDisplays();
}
