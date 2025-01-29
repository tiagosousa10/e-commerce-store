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

  logout : async () => {
    try {
      await axios.post("/auth/logout")
      set({user:null})

    } catch(error) {
      toast.error(error.response.data.message || "Something went wrong during logout" )
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

  refreshToken : async () => {
    //Prevent multiple refresh requests
    if(get().checkAuth) return; // if checkingAuth is true, return

    set({checkingAuth: true}); // Set checkingAuth to true

    try {

      const res = await axios.post("/auth/refresh-token"); // Get the user profile
      set({checkAuth:false}) // means that the user is authenticated

      return res.data; // Return the new access token

    } catch(error) {
      set({user:null, checkingAuth:false}) // means that the user is not authenticated
      throw error;
    }
  }
 
}))

//TODO: implement axios interceptors for refreshing the access token

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if(error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        //if a refresh is already in progress, wait for it to complete
        if(refreshPromise) {
          return axios(originalRequest);
        }

        //start a new refresh request
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise; // Wait for the refresh request to complete
        refreshPromise = null; // Reset the refreshPromise

        //retry the original request
        return axios(originalRequest);


      } catch(error) {
        //if refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(error);
      }
  }
  return Promise.reject(error);
}
)
