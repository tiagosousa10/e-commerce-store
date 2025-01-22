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
