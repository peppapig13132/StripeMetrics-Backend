import { Response } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import Stripe from "stripe";
import { AuthRequest } from "../types/auto-request";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || "";
const stripe = new Stripe(stripeSecretKey);

export const getNewSubscriptionWithDateRange = asyncHandler(async (req: AuthRequest, res: Response) => {
  if(stripeSecretKey == "") {
    res.send("stripe key is required");
  }

  const dateStart = req.body.date_start;
  const dateEnd = (req.body.date_start < req.body.date_end) ? req.body.date_end : (req.body.date_start + 1);
  
  const subscriptions1 = await stripe.subscriptions.list({
    created: {
      gte: dateStart - (dateEnd - dateStart),
      lt: dateStart,
    },
  });

  const count1 = subscriptions1.data.length;

  const subscriptions2 = await stripe.subscriptions.list({
    created: {
      gte: dateStart,
      lt: dateEnd,
    },
  });

  const count2 = subscriptions2.data.length;

  res.json({
    ok: true,
    data: {
      count1: count1,
      count2: count2,
    }
  });
});