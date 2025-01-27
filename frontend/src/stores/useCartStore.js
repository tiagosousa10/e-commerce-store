import {create} from 'zustand'
import axios from '../lib/axios'
import {toast} from 'react-hot-toast'

export const useCartStore = create((set,get) => ({
  //initial state
  cart: [],
  coupon: null,
  total:0,
  subtotal:0,

  getCartItems: async() => {
   try {
    const res = await axios.get("/cart")
    set({cart: res.data})

   } catch(error) {
    set({cart: []})
    toast.error(error.response.data.message || "Something went wrong" )
   }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", {productId: product._id}) 
      toast.success("Product added to cart")

      set((prevState) => {
        const existingItem = prevState.cart.find(item => item.id === product._id) //find if item already exists
        const newCart = existingItem 
        ? // if item already exists
        prevState.cart.map(item => (item._id === product._id ? {...item, quantity: item.quantity + 1} : item))
        : // if item does not exist add it
        [...prevState.cart, {...product, quantity: 1}]

        return {
          cart: newCart
        }
      })
    } catch(error) {
      toast.error(error.response.data.message || "Something went wrong" )
    }
  }
}))
