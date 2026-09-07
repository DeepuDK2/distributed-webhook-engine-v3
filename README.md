# Distributed Webhook Delivery & Async Job Processor

> Fault-tolerant event dispatch engine with exponential backoff & dead-letter queue

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![BullMQ](https://img.shields.io/badge/Queue-BullMQ%20Redis-red.svg)](https://bullmq.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📌 Architecture Overview
High-reliability asynchronous webhook dispatcher engineered with Redis BullMQ, PostgreSQL, and Express/TypeScript. Guarantees at-least-once delivery with cryptographic HMAC-SHA256 request signing and sub-50ms queue enqueue latency.

### Key Systems Engineering Highlights:
- **At-Least-Once Delivery**: Redis BullMQ workers guarantee dispatch execution.
- **Exponential Jitter Retries**: 5-stage backoff prevents thundering herd on downstream receivers.
- **HMAC-SHA256 Cryptographic Signing**: Constant-time signature verification with 300s replay window.
- **Dead-Letter Queue (DLQ)**: Automatic failure routing after max retry attempts with telemetry alerts.

## 🚀 Getting Started
```bash
# 1. Clone repository
git clone https://github.com/DeepuDK2/distributed-webhook-engine.git
cd distributed-webhook-engine

# 2. Boot dependencies (Redis + PostgreSQL)
docker-compose up -d

# 3. Install dependencies & run development server
npm install
npm run dev
```
