import express from 'express';
import dotenv from 'dotenv';
import { protectRoute } from '../middleware/auth.middleware.js';
//import { createCheckoutSession } from '../controllers/payment.controller';
import Coupon from '../models/coupon.model.js';
import { stripe } from '../lib/stripe.js';

dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, async (req,res) => {
  try {
    const {products, couponCode} = req.body

    if(!Array.isArray(products) || products.length === 0) { // Check if products is an array and not empty
      return res.status(400).json({message:"Invalid or empty products"})
    }

    let totalAmount = 0;
    
    const lineItems = products.map(product => { // map over products
      const amount = Math.round(product.price * 100) // stripe wants amount in cents
      totalAmount += amount * product.quantity; // calculate total amount

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image]
          },
          unit_amount: amount
        }
      }
    })

    let coupon = null;
    if(couponCode) {
      coupon = await Coupon.findOne({code:couponCode, userId: req.user._id, isActive:true})
      if(coupon) {
        totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100)) // example of equation with values : 1000 * (20 / 100) = 200
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${process.env.CLIENT_URL}/purchase-cancel`,
      discounts:coupon ? [
        {
          coupon: await createStripeCoupon(coupon.discountPercentage)
        }
    ] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || ""
      }
    })

    
    if(totalAmount >= 20000) {
      await createNewCoupon(req.user._id)
    }
    res.status(200).json({id:session.id, totalAmount: totalAmount/100})

  } catch(error) {

  }
}) 

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
