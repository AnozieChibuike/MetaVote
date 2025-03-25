import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import REACT_APP_SERVER_URL from "../../constant";

const Verify = () => {
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const is_admin = urlParams.get("is_admin") || false;

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    // Call Flask backend to verify token
    fetch(`${REACT_APP_SERVER_URL}/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          // Store email in session
          localStorage.setItem("email", data.email);
          setMessage("Verification successful! Redirecting...");
          if (!is_admin) setTimeout(() => navigate("/voter-dashboard"), 2000);
          else setTimeout(() => navigate("/admin"), 2000);
        } else {
          setMessage("Verification failed.");
        }
      })
      .catch(() => setMessage("Something went wrong."));
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
};

export default Verify;
