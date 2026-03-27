import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("student_token");
    const storedInfo = localStorage.getItem("student_info");
    const storedData = localStorage.getItem("studentdata");

    if (storedToken) setToken(storedToken);
    
    // Joint student profile retrieval
    const info = storedInfo ? JSON.parse(storedInfo) : null;
    const data = storedData ? JSON.parse(storedData) : null;
    const jointStudent = info || data?.data || info?.data || null;

    if (jointStudent) setStudent(jointStudent);

    setLoading(false);
  }, []);

  const login = (token, studentData) => {
    localStorage.setItem("student_token", token);
    localStorage.setItem("student_info", JSON.stringify(studentData));

    setToken(token);
    setStudent(studentData);
  };

  const logout = async () => {
    try {
      if (token) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
        await fetch(`${API_BASE_URL}/api/Students/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear all student-related local storage data
      localStorage.removeItem("student_token");
      localStorage.removeItem("student_info");
      localStorage.removeItem("studentBiodata");
      localStorage.removeItem("studentdata");
      localStorage.removeItem("studentEmail");
      localStorage.removeItem("studentTel");

      setToken(null);
      setStudent(null);

      // Redirect to student login
      window.location.href = "/student/login";
    }
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
