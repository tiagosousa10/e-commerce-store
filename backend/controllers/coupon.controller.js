import Coupon from "../models/coupon.model.js"

export const getCoupon = async (req,res) => {
  try {
    const coupon = await Coupon.findOne({userId: req.user._id, isActive: true})
    res.json(coupon || null)

  } catch(error) {
    console.log("Error in getCoupon , coupon.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const validateCoupon = async ( req,res) => {
  try {
    const {code} = req.body;
    const coupon = await Coupon.findOne({code : code, userId:req.user_id, isActive: true}) // Find the coupon, user and isActive in the database

    if(!coupon) {
      return res.status(404).json({message: "Coupon not found"})
    }

    if(coupon.expirationDate < Date.now()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({message: "Coupon expired"})
    }

    res.json({
      message: "Coupon is valid", 
      code: coupon.code, 
      discountPercentage: coupon.discountPercentage
    })

  } catch(error) {
    console.log("Error in validateCoupon, coupon.controller", error.message)
    res.status(500).json({message: "Server error", error: error.message})
  }
}
