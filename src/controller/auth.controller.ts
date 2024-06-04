import { Request, RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.model";

dotenv.config();

export const signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const u = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(u.password, saltRounds);

  const user = await User.create({
    email: u.email,
    password: passwordHash
  });

  res.json({
    ok: true,
    user: {
      user_id: user.dataValues.id
    }
  });
});

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const u = req.body;
  
  const user = await User.findOne({
    where: {
      email: u.email
    }
  });

  if(user) {
    const isSame = await bcrypt.compare(u.password, user.dataValues.password);

    if(isSame) {
      const secret = process.env.SECRETKEY || '';

      const token = jwt.sign(
        {
          id: user.dataValues.id,
          email: user.dataValues.email,
        },
        secret,
        {
          expiresIn: 1 * 24 * 60 * 60,
        }
      );

      res.json({
        ok: true,
        user: {
          id: user.dataValues.id,
          email: user.dataValues.email,
        },
        token: token
      });
    } else {
      res.json({
        ok: false,
        msg: "incorrect password",
      });
    }
  } else {
    res.json({
      ok: false,
      msg: "unauthorized user",
    });
  }
})