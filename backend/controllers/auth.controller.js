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
