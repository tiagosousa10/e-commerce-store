import Product from "../models/product.model.js";

export const getCartProducts = async (req,res) => {
  try {
    const products = await Product.find({_id: {$in: req.user.cartItems}}) // Find all products in the database
    
    //add quantity for each product
    const cartItems = products.map(product => {
      const item = req.user.cartItems.find(cartItem => cartItem.id === product._id)
      return {...product.toJSON(), quantity: item?.quantity}
    })

    res.json(cartItems)
  } catch(error) {
    console.log("Error in getCartProducts, cart.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const addToCart = async (req,res) => {
  try {
    const {productId} = req.body
    const user = req.user; // from auth middleware

    const existingItem = user.cartItems.find(item=> item.id === productId) // from user model find if item already exists
    if(existingItem) {
      // increment quantity if item already exists
      existingItem.quantity += 1;
    } else {
      // add new item
      user.cartItems.push({productId})
    }

    await user.save()
    res.json(user.cartItems)
  } catch(error) {
    console.log("Error in addToCart , cart.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const removeAllFromCart = async ( req,res) => {
  try {
    const {productId} = req.body;
    const user = req.user; // from auth middleware

    if(!productId) {
      user.cartItems = []; 
    } else {
      user.cartItems = user.cartItems.filter(item => item.id !== productId) // return only items that do not match the productId
    }

    await user.save()
    res.json(user.cartItems)

  } catch(error) {
    console.log("Error in removeAllFromCart , cart.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


export const updateQuantity = async (req,res) => {
  try {
    const {id:productId} = req.params;
    const {quantity} = req.body;
    const user = req.user; // from auth middleware
    const existingItem = user.cartItems.find(item=> item.id === productId) // from user model find if item already exists

    if(existingItem) {
      if(quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId) // return only items that do not match the productId
        await user.save()
        return res.json(user.cartItems)
      } 

      existingItem.quantity = quantity; // update quantity
      await user.save()
      return res.json(user.cartItems)

    } else {
      res.status(404).json({message: "Item not found"})
    }

  } catch(error) {
    console.log("Error in updateQuantity , cart.controller", error.message)
    res.status(500).json({message : "Server error", error: error.message})
  }
}


