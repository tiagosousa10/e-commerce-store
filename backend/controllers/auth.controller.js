import { redis } from "../lib/redis.js";
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
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60) // 7 days
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

    res.status(201).json({user, message: "User created successfully"})

  } catch(error) {
    res.status(500).json({message: error.message})
  }
};


export const login = (req, res) => {
  res.send("login");
};

export const logout = (req, res) => {
  res.send("logout");
};  
