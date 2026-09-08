import express from 'express';
import { z } from 'zod';
import { createWebhookJob } from './queue';
import { verifyHmacSignature } from './security';

const app = express();
app.use(express.json());

const WebhookSchema = z.object({
  targetUrl: z.string().url(),
  eventType: z.string().min(1),
  payload: z.record(z.any()),
  secret: z.string().min(8),
  idempotencyKey: z.string().uuid().optional(),
});

app.post('/api/v1/dispatch', async (req, res) => {
  const parsed = WebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload schema', issues: parsed.error.issues });
  }

  const job = await createWebhookJob(parsed.data);
  return res.status(202).json({
    status: 'enqueued',
    jobId: job.id,
    targetUrl: parsed.data.targetUrl,
    enqueuedAt: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Webhook Dispatcher API listening on port ${PORT}`);
});
