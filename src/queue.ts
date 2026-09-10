import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { signPayload } from './security';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const webhookQueue = new Queue('webhook-dispatches', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s, 8s, 16s with jitter
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export async function createWebhookJob(data: any) {
  return await webhookQueue.add(data.eventType, data, {
    jobId: data.idempotencyKey,
  });
}

export const webhookWorker = new Worker(
  'webhook-dispatches',
  async (job: Job) => {
    const { targetUrl, payload, secret } = job.data;
    const bodyStr = JSON.stringify(payload);
    const signature = signPayload(bodyStr, secret, Math.floor(Date.now() / 1000));

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LaunchPad-Signature': signature,
        'User-Agent': 'LaunchPad-Webhook-Engine/1.0',
      },
      body: bodyStr,
      signal: AbortSignal.timeout(5000), // 5s hard timeout
    });

    if (!response.ok) {
      throw new Error(`Delivery failed with status ${response.status}: ${response.statusText}`);
    }

    return { status: 'delivered', code: response.status };
  },
  {
    connection: redisConnection,
    concurrency: 20, // 20 concurrent HTTP dispatches
  }
);
