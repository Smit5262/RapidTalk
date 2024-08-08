import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
});

export default axiosInstance;
