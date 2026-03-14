import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("student_token");
    const storedStudent = localStorage.getItem("student_info");

    if (storedToken) setToken(storedToken);
    if (storedStudent) setStudent(JSON.parse(storedStudent));

    setLoading(false);
  }, []);

  const login = (token, studentData) => {
    localStorage.setItem("student_token", token);
    localStorage.setItem("student_info", JSON.stringify(studentData));

    setToken(token);
    setStudent(studentData);
  };

  const logout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_info");
    localStorage.removeItem("studentBiodata");

    setToken(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        student,
        login,
        logout,
        isAuthenticated: Boolean(token),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => useContext(AuthContext);
