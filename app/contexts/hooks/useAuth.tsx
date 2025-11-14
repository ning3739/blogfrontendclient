import { useContext } from "react";
import { AuthContext } from "../authContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // SWR的fetcher已经提取了response.data，所以context.user就是用户数据本身
  return {
    ...context,
    user: context.user || null,
  };
};
