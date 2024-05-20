import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.model";
import { AuthRequest } from "../types/auto-request";

dotenv.config();

export const checkDuplicatedEmail = async (req: Request, res: Response, next: NextFunction) => {
  const u = req.body;

  const user = await User.findOne({
    where: {
      email: u.email
    }
  });

  if(user) {
    return res.json({
      ok: false,
      msg: "middleware: username already taken",
    });
  }

  next();
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if(!token) {
    return res.json({
      ok: false,
      msg: "no token provided",
    });
  }

  jwt.verify(
    token,
    `${process.env.SECRETKEY}`,
    async (err: any, decoded: any) => {
      if(err) {
        return res.json({
          ok: false,
          msg: "invalid token",
        });
      }

      const userId = (decoded as JwtPayload).id;
      const email = (decoded as JwtPayload).email;

      const user = await User.findOne({
        where: {
          id: userId,
          email: email,
        }
      });

      if(user) {
        req.user = {
          id: user.dataValues.id,
          email: user.dataValues.email,
        }

        next();
      } else {
        return res.json({
          ok: false,
          msg: "invalid token",
        });
      }
    }
  );
}