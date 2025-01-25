//hook
import {create} from 'zustand'
import axios from "../lib/axios";
import {toast} from 'react-hot-toast'

export const useUserStore = create((set,get) => ({
  //initial state
  user:null,
  loading:false,
  checkingAuth:true,

  signup: async ({name,email,password,confirmPassword}) => {
    set({loading:true})

    if(password !== confirmPassword) {
      set({loading:false})
      return toast.error("Passwords do not match")
    }

    try {
      const res = await axios.post("/auth/signup", {name,email,password})
      set({user: res.data, loading:false})

    } catch(error) {
      set({loading:false})
      toast.error(error.response.data.message || "Something went wrong" )
    }
  },

  login: async ({email,password}) => {
    set({loading:true})

    try {
      const res = await axios.post("/auth/login", {email,password})
      set({user: res.data, loading:false})

    } catch(error) {
      set({loading:false})
      toast.error(error.response.data.message || "Something went wrong" )
    }
  },

  checkAuth : async () => {
    set({checkingAuth: true}); // Set checkingAuth to true
    try {
      const res = await axios.get("/auth/profile"); // Get the user profile
      set({user:res.data, checkingAuth:false}) // means that the user is authenticated

    } catch(error) {
      set({user:null, checkingAuth:false}) // means that the user is not authenticated
      console.log(error.message) 
    }
  },

  logout : async () => {
    try {
      await axios.post("/auth/logout")
      set({user:null})

    } catch(error) {
      toast.error(error.response.data.message || "Something went wrong during logout" )
    }

  }

}))

//TODO: implement axios interceptors for refreshing the access token
