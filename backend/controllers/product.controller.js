import { redis } from "../lib/redis.js"
import { cloudinary } from "../lib/cloudinary.js"

import Product from "../models/product.model.js"


export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}) // Find all products in the database
    res.json({products})

  } catch(error) {
    console.log("Error in getAllProducts , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}

export const getFeaturedProducts = async(req,res) => {
  try {
    let featuredProducts = await redis.get("featured_products") // Get the featured products from Redis
    if(featuredProducts) {
      res.json(JSON.parse(featuredProducts))
    }

    //if not in redis, fetch from mongodb
    //.lean() is gonna return a plain javascript object instead of a mongodb document
    //which is good for performance
    featuredProducts = await Product.find({isFeatured: true}).lean() // Find all featured products in the database

    if(!featuredProducts) {
      return res.status(404).json({message: "No featured products found"})
    }

    //store in redis for future quick acess

    await redis.set("featured_products", JSON.stringify(featuredProducts)) // Store the featured products in Redis

    res.json(featuredProducts)

  } catch(error) {
    console.log("Error in getFeaturedProducts , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const createProduct = async (req,res) => {
  try {
    const {name,description,price,image,category} = req.body

    let cloudinaryResponse = null;

    if(image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"}) // Upload the image to Cloudinary
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
      category
    })

    res.status(201).json(product)

  } catch(error) {
    console.log("Error in createProduct , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}
