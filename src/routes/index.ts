import { Request, Response } from "express";
import authRouter from "../routes/auth.route";
import stripeRouter from "../routes/stripe.route";
import { authenticate } from "../middleware/auth.middleware";

export default (app: any) => {
  app.get("/api", (req: Request, res: Response) => {
    res.send("Express.js server is running!");
  });

  app.use("/auth", authRouter);
  app.use("/stripe", authenticate, stripeRouter);

  app.use("*", function (req: Request, res: Response) {
    res.status(404).send("404 | Bad request!");
  });
}