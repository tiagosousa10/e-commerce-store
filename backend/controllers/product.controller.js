import { redis } from "../lib/redis.js"
import  cloudinary  from "../lib/cloudinary.js"

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


export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


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


export const deleteProduct = async (req,res) => {
  try {
    const product = await Product.findById(req.params.id) // from url params

    if(!product) {
      return res.status(404).json({message: "Product not found"})
    }

    if(product.image) {
      const publicId = product.image.split("/").pop().split(".")[0] // Get the public id from the image url

      try {
        await cloudinary.uploader.destroy(`products/${publicId}`) // Delete the image from Cloudinary
        console.log("delete image from cloudinary")
      } catch(error) { 
        console.log("Error in deleteProduct , product.controller", error.message)
       }       
    }

    await Product.findByIdAndDelete(req.params.id) // Delete the product from the MongoDB database
    
    res.json({message : "Product deleted successfully"})
  } catch(error) {
    console.log("Error in deleteProduct , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const getRecommendedProducts = async (req,res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: {size: 4}
      },
      {
        $project: {
          _id:1,
          name:1,
          description:1,
          image:1,
          price:1
        }
      }
  ])

  res.json(products)

  } catch(error) {
    console.log("Error in getRecommendedProducts , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const getProductsByCategory = async (req,res) => {
  const {category} = req.params;

  try {
    const products = await Product.find({category}) // Find all products in the database by category
    res.json({products})

  } catch(error) {
    console.log("Error in getProductsByCategory , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const toggleFeaturedProduct = async (req,res) => {
  try {
    const product = await Product.findById(req.params.id) // Find the product by id

    if(product) {
      product.isFeatured = !product.isFeatured // Toggle the isFeatured property
      const updatedProduct = await product.save() // Save the updated product
      await updateFeaturedProductsCache() // Update the featured products cache

      res.json(updatedProduct)
    } else {
      res.status(404).json({message: "Product not found"})
    }
  } catch(error) {
    console.log("Error in toggleFeaturedProduct , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({isFeatured: true}).lean() // Find all featured products in the database
    await redis.set("featured_products", JSON.stringify(featuredProducts)) // Store the featured products in Redis

  } catch(error) {
    console.log("Error in updateFeaturedProductsCache , product.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}
