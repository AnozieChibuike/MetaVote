import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import REACT_APP_SERVER_URL from "../../constant";
import Loader from "../../components/loader";
import { FaUserShield, FaLock } from "react-icons/fa";

function AdminSignIn() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (res.ok) {
          navigate("/admin");
        }
      } catch (error) {
        console.log("Not logged in");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important for sessions
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 font-sans">
      {loading && <Loader />}

      <div className="mb-8 text-center animate-fade-in-down">
        <a
          href="/"
          className="text-3xl font-extrabold tracking-tighter text-blue-600 hover:scale-105 transition-transform inline-block"
        >
          Meta<span className="text-red-500">Vote</span>
        </a>
        <p className="text-gray-400 mt-2 tracking-wide text-sm uppercase">
          Secure Admin Portal
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-blue-900/10">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Admin Initialization
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
              <FaUserShield />
            </div>
            <input
              type="text"
              placeholder="Admin Username"
              className="w-full bg-gray-950 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Secure Password"
              className="w-full bg-gray-950 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transform transition-all active:scale-[0.98] hover:shadow-blue-500/30"
          >
            Authenticate
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-sm text-center font-medium animate-pulse ${message.includes("success") ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-600">
        <p>&copy; 2026 MetaVote Secure Systems. Authorized Access Only.</p>
      </div>
    </div>
  );
}

export default AdminSignIn;
