import React from "react";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput } from "flowbite-react";
import REACT_APP_SERVER_URL from "../../constant";
import Loader from "../../components/loader";

function AdminSignIn () {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  // const [message, setMessage] = useState('');

  const inputsRef = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, ''); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (index < 5 && value) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const requestOtp = async () => {
    if (!email) {
      setMessage('Please enter an email.');
      return;
    }
    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_SERVER_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage('Server error');
    }
    finally {
      setLoading(false)
    }
  };

  const verifyOtp = async () => {
    setLoading(true)
    const code = otp.join('');
    if (code.length !== 6) return setMessage('Enter full OTP');

    try {
      const res = await fetch(`${REACT_APP_SERVER_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (!!data.message) {
        localStorage.setItem("email", email);
        setMessage(<><p><span className="text-green-500">Verification successful!</span> Redirecting...</p><p>If page doesn't automatically redirect, click this <a href="/admin" className="text-blue-700">link</a></p></>);
        setTimeout(() => navigate("/admin"), 2000);
      }
    } catch (err) {
      setMessage('Verification failed');
    } finally {
      setLoading(false)
    }
  };





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

  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
  //     <a href='/' className="text-xl font-bold text-blue-600 mb-4">
  //       Meta<span className="text-red-400">Vote</span>
  //     </a>
  //     <h2 className="text-3xl font-bold mb-4">Sign In</h2>
  //     <p className="text-gray-400 mb-6">Enter your email to receive a sign in link</p>
  //     <div className="relative">
  //     <TextInput
  //       type="email"
  //       placeholder="Enter your email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //       className="w-80 mb-4"
  //     />      
  //     </div>
  //     <Button color="blue" onClick={sendVerificationLink}>Send Link</Button>
  //     {message && <p className="mt-4 text-gray-300">{message}</p>}
  //   </div>
  // );

  return (
    
    // <div className="h-[100vh] flex items-center justify-center bg-black text-center px-6">
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
    {loading && <Loader />}
        <a href='/' className="text-xl font-bold text-blue-600 mb-4">
         Meta<span className="text-red-400">Vote</span>
     </a>
    <div className="p-4 max-w-sm mx-auto border rounded shadow">
      <h2 className="text-xl font-bold mb-4">OTP Verification</h2>

      <input
        type="email"
        placeholder="Enter email"
        className="w-full text-black p-2 border mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={otpSent}
      />

      {!otpSent ? (
        <button
          onClick={requestOtp}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Request OTP
        </button>
      ) : (
        <>
          <div className="flex gap-2 justify-center my-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                ref={(el) => (inputsRef.current[idx] = el)}
                className="w-10 text-black h-10 text-center text-xl border rounded"
              />
            ))}
          </div>
          <button
            onClick={verifyOtp}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}

      {message && <p className="mt-3 text-sm text-center text-gray-700">{message}</p>}
    </div>
    </div>
  );

};

export default AdminSignIn;