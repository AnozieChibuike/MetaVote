import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import REACT_APP_SERVER_URL from "../../constant";

const Verify = () => {
const [inApp, setInApp] = useState(false);

function checkBrowser () {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Detect Gmail and other common in-app browsers
    const isInAppBrowser = /(FBAN|FBAV|Instagram|Line|Snapchat|WhatsApp|Twitter|Gmail|Android.*WebView|iPhone.*Safari\/|CriOS)/i.test(userAgent);
    setInApp(isInAppBrowser)
    if (isInAppBrowser) {
        // Notify the user
        setMessage("It looks like you're using an in-app browser. For the best experience, please open this link in your main browser.");

        // Optionally provide a button to redirect
        const redirectButton = document.createElement('button');
        redirectButton.innerText = "Open in Browser";
        redirectButton.style = "position: fixed; bottom: 20px; right: 20px; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;";
        redirectButton.onclick = () => {
            window.location.href = window.location.href; 
        };
        document.body.appendChild(redirectButton);
      }
}

  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const is_admin = urlParams.get("is_admin") || false;
    checkBrowser()

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }
    if (inApp) return;
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
