import { RequestHandler, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

export const test: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    ok: true,
    msg: '',
  });
});