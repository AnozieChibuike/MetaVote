import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook to protect admin routes.
 * It checks the session via the backend API.
 * Returns { loading, authenticated }
 */
const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          navigate("/signin"); // Redirect to login
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthenticated(false);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { loading, authenticated };
};

export default useAdminAuth;
