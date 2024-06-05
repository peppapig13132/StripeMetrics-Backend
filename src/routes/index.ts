import { Application, Request, Response } from 'express';
import authRouter from '../routes/auth.route';
import stripeRouter from '../routes/stripe.route';
import testRouter from '../routes/test.route';
import { authenticate } from '../middleware/auth.middleware';
import path from 'path';

export default (app: Application) => {
  app.get('/api', (req: Request, res: Response) => {
    res.send('Express.js server is running!');
  });

  app.use('/api/auth', authRouter);
  app.use('/api/stripe', authenticate, stripeRouter);
  app.use('/api/test', testRouter);
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'static', 'index.html'));
  });
}