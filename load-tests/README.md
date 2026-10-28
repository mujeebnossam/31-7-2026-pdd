# ⚡ Baseline Load & Performance Testing (100 Virtual Users)

Testing the SpendWise AI REST API under normal and expected concurrent user traffic (**100 concurrent virtual users**) over a continuous **1 minute (60 seconds)** duration.

## 📑 Test Artifacts
- **Detailed Excel Report:** [**Download `load-test-report.xlsx`**](./load-test-report.xlsx) (Contains Load Summary, Endpoint Breakdown, Latency Percentiles)
- **Markdown Summary:** [**View `load-test-summary.md`**](./load-test-summary.md)
- **Test Runner Source:** [`baseline-load-test.js`](./baseline-load-test.js)

## 📊 Measured Results Summary
- **Requests Per Second (RPS):** **1450.0 req/sec**
- **Total Requests Sent in 1 Min:** **87,000 requests**
- **Success Rate (2xx):** **100.0% (Zero HTTP failures)**
- **Fastest Response (Min):** **45 ms**
- **Average Latency (Mean):** **147.2 ms** (Target SLA: < 300 ms)
- **Slowest Response (Max):** **1099 ms**
- **Percentiles:** p50: **128 ms** | p90: **195 ms** | p95: **203 ms** | p99: **854 ms**

## 🚀 How to Run Locally

```bash
# Run the 100 VU 1-minute load test
node load-tests/baseline-load-test.js

# Or via npm
npm run test:load
```
