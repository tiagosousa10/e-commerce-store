//axios
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" :"/api", // backend url
  withCredentials: true, // send cookies

})


export default axiosInstance;
