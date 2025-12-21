import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";

const useUser = () => {
  const axiosSecure = useAxiosSecure();
  const { user: firebaseUser, loading: authLoading } = useAuth();

  const {
    data: dbUser = null,
    isLoading: isDbUserLoading,
    refetch,
    isFetching,
  } = useQuery({
    enabled: !authLoading && !!firebaseUser?.email,
    queryKey: ["dbUser", firebaseUser?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${firebaseUser?.email}/role`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    dbUser,
    isLoading: authLoading || isDbUserLoading,
    refetch,
    isFetching,
    isSuspended: dbUser?.status === "suspended",
  };
};

export default useUser;
