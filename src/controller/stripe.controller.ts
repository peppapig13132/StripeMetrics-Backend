import { Response } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import { AuthRequest } from "../types/auto-request";

dotenv.config();

export const index = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.send(req.user)
});