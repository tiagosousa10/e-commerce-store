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
  

  fetchProductsByCategory : async (category) => {
    set({loading:true})

    try {
      const res = await axios.get(`/products/category/${category}`) // Fetch products by category from the backend
      set({products: res.data.products, loading:false})
    } catch(error) {
      set({error: "Failed to fetch products",loading:false})
      toast.error(error.response.data.message || "Failed fetching products" )
    }
  },


  deleteProduct : async (productId) => {
    set({loading:true})
    try {
      await axios.delete(`/products/${productId}`) // Delete the product from the backend
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== productId), // Remove the deleted product from the state
        loading:false
      }))
    } catch(error) {
      set({loading:false})
      toast.error(error.response.data.message || "Something went wrong" )
    }
  },

  
  toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.put(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},

  fetchFeaturedProducts : async () => {
    set({loading:true})
    try {
      const res= await axios.get("/products/featured")
      set({products: res.data, loading:false})
    } catch(error) {
      set({error: "Failed to fetch products",loading:false})
      console.log("Error in fetchFeaturedProducts",error)
    }
  }

}))


