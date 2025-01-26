import {create} from 'zustand'
import toast from 'react-hot-toast'
import axios from '../lib/axios'


export const useProductStore = create((set) =>({
  products: [],
  loading:false,

  setProducts: (products) => set({products}),

  createProduct : async (productData) => {
    set({loading:true})

    try {
      const res = await axios.post("/products", productData) // Send the product data to the backend
      set((prevState) => ({
        products: [...prevState.products, res.data], // Add the new product to the state
        loading:false
      }))
    } catch(error) {
      toast.error(error.response.data.message || "Something went wrong" )
      set({loading:false})
    }
  },

  fetchAllProducts : async () => {
    set({loading:true})
    try {
      const res = await axios.get("/products")  // Fetch all products from the backend
      set({products: res.data.products, loading:false}) // update the products state list
    } catch(error) {
      set({error: "Failed to fetch products",loading:false})
      toast.error(error.response.data.message || "Failed fetching products" )
    }
  },

  deleteProduct : async (id) => {},

  toggleFeaturedProduct : async (id) => {}


}))


