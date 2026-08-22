import { createContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
}

export default AuthContext;