import Product from "../models/product.model"

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}) // Find all products in the database
    res.json({products})
    
  } catch(error) {
    console.log("Error in getAllProducts , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}
