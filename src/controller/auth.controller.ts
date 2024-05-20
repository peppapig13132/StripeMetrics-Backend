import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const u = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(u.password, saltRounds);

  const user = {
    email: u.email,
    password: passwordHash
  };

  res.send(user);
});