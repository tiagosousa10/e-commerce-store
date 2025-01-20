import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken; // Get the access token from the cookie

    if(!accessToken) {
      return res.status(401).json({message:"Unauthorized or access token not found"})
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // Verify the access token

      const user = await User.findById(decoded.userId).select("-password"); // Find the user in the database

      if(!user) {
        return res.status(401).json({message:"User not found"})
      }

      req.user = user; // Set the user object in the request

      next()

    } catch(error) {

      if(error.name === "TokenExpiredError") {
        return res.status(401).json({message:"Access token expired"})
    }
    throw error;
  }
    
  } catch(error) {
    console.log("Error in protectRoute middleware", error.message)
    return res.status(500).json({message:"Server error in protectRoute middleware", error: error.message})
  }
}


export const adminRoute = async(req,res,next) => {
  if(req.user && req.user.role === "admin") { // If the user is an admin
    next()
  } else {
    return res.status(401).json({message:"Unauthorized - Only admin can access this route"})
  }
}
