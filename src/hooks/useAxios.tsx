import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://stitch-logic-server.vercel.app/api/v1",
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
