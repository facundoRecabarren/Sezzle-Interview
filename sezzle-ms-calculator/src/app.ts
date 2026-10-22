import express, { Application } from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  app.use('/v1', calculateRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
