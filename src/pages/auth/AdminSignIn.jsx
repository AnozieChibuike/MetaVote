import React from "react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput } from "flowbite-react";
import REACT_APP_SERVER_URL from "../../constant";

function AdminSignIn () {
    const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) navigate("/admin"); // Redirect if already signed in
  }, [navigate]);

  const sendVerificationLink = async () => {
    if (!email) return setMessage("Please enter your email.");
    setMessage("Sending verification link...");

    try {
      const res = await fetch(`${REACT_APP_SERVER_URL}/mail/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, is_admin: true }),
      });
      if (res.status !== 200) {
        const errorData = await res.json();
        console.log(errorData)
        throw new Error(errorData.error || "Failed to send email.");
      }
      const data = await res.json();
      setMessage(data.message || "Check your email for the link.");
    } catch (error) {
      console.log(error)
      setMessage(`Failed to send email. Try again: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
      <a href='/' className="text-xl font-bold text-blue-600 mb-4">
        Meta<span className="text-red-400">Vote</span>
      </a>
      <h2 className="text-3xl font-bold mb-4">Sign In</h2>
      <p className="text-gray-400 mb-6">Enter your email to receive an OTP</p>
      <div className="relative">
      <TextInput
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-80 mb-4"
      />
      <a className="text-blue-500 absolute top-2 right-2">get code</a>
      </div>
      <TextInput
        type="number"
        placeholder="otp"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-80 mb-4"
      />
      <Button color="blue" onClick={sendVerificationLink}>Send Link</Button>
      {message && <p className="mt-4 text-gray-300">{message}</p>}
    </div>
  );
};

export default AdminSignIn;