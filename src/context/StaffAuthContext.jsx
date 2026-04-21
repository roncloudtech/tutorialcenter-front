import { createContext, useContext, useEffect, useState, useCallback } from "react";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [staff, setStaff] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);

  // Load from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("staff_token");
    const storedInfo = localStorage.getItem("staff_info");
    const storedRole = localStorage.getItem("staff_role");

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedInfo) setStaff(JSON.parse(storedInfo));

    // Initialize activity tracker
    localStorage.setItem("staff_last_activity_at", Date.now().toString());

    setLoading(false);
  }, []);

  const login = useCallback((token, staffData, staffRole) => {
    localStorage.setItem("staff_token", token);
    localStorage.setItem("staff_info", JSON.stringify(staffData));
    localStorage.setItem("staff_role", staffRole);
    localStorage.setItem("staff_last_activity_at", Date.now().toString());

    setToken(token);
    setStaff(staffData);
    setRole(staffRole);
  }, []);

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem("staff_token");
      if (currentToken) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
        await fetch(`${API_BASE_URL}/api/staffs/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "Accept": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Staff logout failed:", error);
    } finally {
      // Clear all staff-related local storage data
      localStorage.removeItem("staff_token");
      localStorage.removeItem("staff_info");
      localStorage.removeItem("staff_role");
      localStorage.removeItem("staff_last_activity_at");

      setToken(null);
      setStaff(null);
      setRole(null);
      setIsInactiveModalOpen(false);

      // Redirect to staff login
      window.location.href = "/staff/login";
    }
  }, []);

  const resetActivity = useCallback(() => {
    localStorage.setItem("staff_last_activity_at", Date.now().toString());
    setIsInactiveModalOpen(false);
  }, []);

  // Interaction monitoring
  useEffect(() => {
    if (!token) return;

    const handleActivity = () => {
      localStorage.setItem("staff_last_activity_at", Date.now().toString());
    };

    // Set initial activity on login/start
    handleActivity();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    const interval = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem("staff_last_activity_at") || "0");
      const diff = Date.now() - lastActivity;

      const THREE_MINUTES = 3 * 60 * 1000;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (diff >= FIVE_MINUTES) {
        logout();
      } else if (diff >= THREE_MINUTES) {
        setIsInactiveModalOpen(true);
      } else {
        setIsInactiveModalOpen(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(interval);
    };
  }, [token, logout]);

  return (
    <StaffAuthContext.Provider
      value={{
        token,
        staff,
        role,
        login,
        logout,
        isAuthenticated: Boolean(token),
        loading,
        isInactiveModalOpen,
        resetActivity
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export const useStaffAuth = () => useContext(StaffAuthContext);
