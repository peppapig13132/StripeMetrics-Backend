import { Request, Response, NextFunction } from "express";
import User from "../model/user.model";

export const checkDuplicatedEmail = async(req: Request, res: Response, next: NextFunction) => {
  const u = req.body;

  const user = await User.findOne({
    where: {
      email: u.email
    }
  });

  if(user) {
    return res.json({
      "ok": false,
      "msg": "middleware: username already taken"
    });
  }

  next();
}
