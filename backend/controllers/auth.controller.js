import { safeRedisGet, safeRedisSet, safeRedisDel } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"


const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  })

  const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, { 
    expiresIn: "7d"
  })

  return {accessToken, refreshToken}
}


const storeRefreshToken = async (userId,refreshToken) => { // Store the refresh token in Redis
  await safeRedisSet(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60) // 7 days
}


const setCookies = (res,accessToken,refreshToken) => {
  res.cookie("accessToken", accessToken, { // Set the access token as a cookie
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie 
    secure: process.env.NODE_ENV === "production", // Only allow the cookie to be sent over HTTPS if NODE_ENV is set to "production
    sameSite: "strict", // Prevent the cookie from being sent to the client on cross-site requests
    maxAge: 15*60*1000 // Set the maximum age of the cookie to 15 minutes
  })

  res.cookie("refreshToken", refreshToken, { // Set the access token as a cookie
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie 
    secure: process.env.NODE_ENV === "production", // Only allow the cookie to be sent over HTTPS if NODE_ENV is set to "production
    sameSite: "strict", // Prevent the cookie from being sent to the client on cross-site requests
    maxAge: 7*24*60*60*1000 // MAX age of the cookie to 7 days 
  })
}


export const signup = async (req, res) => {
  const {email,password, name} = req.body;
  
  try {
    const userExists = await User.findOne({email})

    if(userExists) {
      return res.status(400).send({message: "User already exists"})
    }
  
    const user = await User.create({
      name,
      email,
      password
    })

    //authenticate
    const {accessToken, refreshToken} =  generateTokens(user._id)
    await storeRefreshToken(user._id, refreshToken) // Store the refresh token in Redis from user id that was just created
  
    setCookies(res,accessToken,refreshToken)

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
     })

  } catch(error) {
    console.log("Error in SignUp , auth.controller", error.message)
    res.status(500).json({message: error.message})
  }
};


export const login = async (req, res) => {
  try {
    const {email, password} = req.body; // Get the email and password from the request body
    const user = await User.findOne({email}) // Find the user in the database

    if(user && (await user.comparePassword(password))) { // If the user exists and the password is correct
      const {accessToken, refreshToken} = generateTokens(user._id)  

      await storeRefreshToken(user._id, refreshToken) // Store the refresh token in Redis from user id that was just created
      setCookies(res,accessToken,refreshToken)

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    } else {
      res.status(400).json({message: "Invalid email or password"})
    }

  } catch(error) {
    console.log("Error in Login , auth.controller", error.message)
    res.status(500).json({message: error.message})
  }
};


export const logout = async (req, res) => {
 try {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie

    if(refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) // Verify the refresh token
      await safeRedisDel(`refresh_token:${decoded.userId}`) // Delete the refresh token from Redis
    }

    res.clearCookie("accessToken") // Clear the access token cookie
    res.clearCookie("refreshToken") // Clear the refresh token cookie
    res.json({message: "Logout successful"})

 } catch(error) {
    console.log("Error in Logout , auth.controller", error.message)
    res.status(500).json({message:"Server error in Logout" , error: error.message})
 }
};  

//this will refresh the  access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from the cookie

    if(!refreshToken) {
      return res.status(401).json({message:"Unauthorized or refresh token not found"})
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) // Verify the refresh token

    const storedToken = await safeRedisGet(`refresh_token:${decoded.userId}`) // Get the refresh token from Redis

    // If Redis is unavailable, we'll still allow the refresh (graceful degradation)
    // In production, you might want stricter validation
    if(storedToken !== null && storedToken !== refreshToken) { // If the refresh token is not the same as the one in Redis
      return res.status(401).json({message:"Invalid refresh token"})
    }

    const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, { // Generate a new access token
      expiresIn: "15m"
    })

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15*60*1000
    })

    res.json({message: "Refresh token successful"})

  } catch(error) {
    res.status(500).json({message: "Server error in refresh token", error: error.message})
  }
 }

 
export const getProfile = async (req,res) => {
  try {
    res.json(req.user)
  } catch(error) {
    console.log("Error in getProfile , auth.controller", error.message)
    res.status(500).json({message: "Server error in get profile", error: error.message})
  }
}
