import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';
import { createCheckoutSession } from '../controllers/payment.controller';
import Coupon from '../models/coupon.model';
import { stripe } from '../lib/stripe';


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
      success_url:"http://localhost:3000/purchase-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:"http://localhost:3000/purchase-cancel"
    })


  } catch(error) {

  }
}) 

export default router;
