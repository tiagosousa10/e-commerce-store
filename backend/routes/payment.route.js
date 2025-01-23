import express from 'express';
import dotenv from 'dotenv';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createCheckoutSession } from '../controllers/payment.controller';
import Coupon from '../models/coupon.model.js';
import { stripe } from '../lib/stripe.js';

dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession ) 


async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once"
  })

  return coupon.id;
}


// create a new coupon using the coupon model
async function createNewCoupon(userId) { 
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId:userId
  })

  await newCoupon.save(); // save the new coupon in the database

  return newCoupon;

}

export default router;
