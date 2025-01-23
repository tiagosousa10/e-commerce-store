import express from 'express';
import dotenv from 'dotenv';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createCheckoutSession } from '../controllers/payment.controller.js';
import { stripe } from '../lib/stripe.js';
import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js';


dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession ) 
router.post("/checkout-success", protectRoute, async (req,res) => {
  try {
    const {sessionId} = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId); // Retrieve the session from Stripe

    if(session.payment_status === "paid") {
      if(session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
           isActive: false
          }
        )
      }

      //create a new order
      const products = JSON.parse(session.metadata.products) // Get the products from the session created by Stripe checkout
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map(product => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price
        })),
        totalAmount: session.amount_total / 100, //convert to dollars
        stripeSessionId: sessionId // Add the Stripe session ID to the order from req.body
      })

      await newOrder.save() // save the order to the database
      res.status(200).json({
        success:true,
        message: "Payment successful, order created, and coupon deactivated if used",
        orderId: newOrder._id
      })
      }
  } catch(error) {
    console.log("Error in checkout-success , payment.route", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}) 




export default router;
