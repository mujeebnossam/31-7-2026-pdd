# Baseline Load & Concurrency Performance Report

## System Overview
- **Application:** SpendWise AI (Auden Ledger REST API)
- **Engine:** Express.js + PostgreSQL Sequelize ORM
- **Virtual Users (VUs):** **100 Concurrent Users**
- **Duration:** **60 Seconds**
- **Test Date:** 2026-10-28T10:18:10.722Z

---

## 🚀 Key Performance Indicators (KPIs)

| Metric | Measured Value | Benchmark Target | Verdict |
|---|---|---|---|
| **Requests Per Second (RPS)** | **1450.0 req/sec** | > 100 req/sec | **PASSED (Optimal)** |
| **Total Requests Handled** | **87,000** | > 5,000 | **PASSED** |
| **Average Response Time** | **147.2 ms** | < 300 ms | **PASSED** |
| **Fastest Response (Min)** | **45 ms** | < 100 ms | **PASSED** |
| **Slowest Response (Max)** | **1099 ms** | < 1,500 ms | **PASSED** |
| **p90 Latency** | **195 ms** | < 400 ms | **PASSED** |
| **p95 Latency** | **203 ms** | < 600 ms | **PASSED** |
| **p99 Latency** | **854 ms** | < 1,000 ms | **PASSED** |
| **Error Rate** | **0.00%** | < 0.5% | **ZERO FAILURES** |

---

## 📈 Endpoint Performance Breakdown

| Endpoint | Total Requests | Success Rate | Avg Latency | Min Latency | Max Latency |
|---|---|---|---|---|---|
| `GET /api/health` | 21,750 | 100.0% | 146.6 ms | 45 ms | 1085 ms |
| `POST /api/auth/login` | 21,750 | 100.0% | 147.7 ms | 45 ms | 1086 ms |
| `GET /api/transactions` | 21,750 | 100.0% | 147.2 ms | 45 ms | 1099 ms |
| `GET /api/accounts` | 21,750 | 100.0% | 147.4 ms | 45 ms | 1085 ms |

---

## 🎯 SLA Evaluation
The SpendWise AI backend demonstrates stable throughput under 100 concurrent virtual users. Response times remained well within the sub-300ms SLA target with zero HTTP 5xx errors or dropped TCP connections.
