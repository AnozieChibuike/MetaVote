// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateElectionPage from "./pages/CreateElectionPage";
import WhitelistPage from "./pages/WhitelistPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import AppProvider from "./context/AppContext";
import ManageElection from "./pages/ManageElection";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiMail } from "react-icons/ci";
import Admin from "./pages/admin";
import AdminSignin from './pages/auth/AdminSignIn'
import WhiteListed from "./pages/WhiteListed";
import VoterSignin from "./pages/auth/VoterSignIn";
import VoterDashboard from "./pages/VoterDashboard";
import NotFound from "./pages/NotFound";
import Verify from "./pages/auth/Verify";
// import { Analytics } from "@vercel/analytics/react"
const App = () => {
  window.document.title = "Meta Vote";
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<CreateElectionPage />} />
          <Route path="/manage" element={<ManageElection />} />
          <Route path="/whitelist" element={<WhitelistPage />} />
          <Route path="/voters" element={<WhiteListed />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/signin" element={<AdminSignin />} />
          <Route path="/voter-signin" element={<VoterSignin />} />
          <Route path="/voter-dashboard" element={<VoterDashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-bold text-blue-600 text-center">
            Meta<span className="text-red-400">Vote</span>
          </h1>
          {/* Copyright Section */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">
              Copyright © {new Date().getFullYear()} MetaVote. All rights
              reserved.
            </p>
          </div>

          {/* Name Section */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">Anozie Joel</h3>
            <p className="text-sm text-gray-400">
              Building solutions one step at a time.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <a
              href="https://x.com/JoelBlvck2"
              className="text-gray-400 hover:text-white"
              aria-label="Twitter"
            >
              <FaXTwitter size={22} />
            </a>
            <a
              href="https://www.instagram.com/joel_is_batman"
              className="text-gray-400 hover:text-white"
              aria-label="Instagram"
            >
              <FaInstagram size={22} />
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=%2B2347040361805&text&type=phone_number&app_absent=0"
              className="text-gray-400 hover:text-white"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={22} />
            </a>
            <a
              href="https://github.com/AnozieChibuike"
              className="text-gray-400 hover:text-white"
              aria-label="GitHub"
            >
              <FaGithub size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/anoziejoel/"
              className="text-gray-400 hover:text-white"
              aria-label="Linkedin"
            >
              <FaLinkedin size={22} />
            </a>
            <a
              href="mailto:chibuikenozie0@gmail.com"
              className="text-gray-400 hover:text-white"
              aria-label="Mail"
            >
              <CiMail size={22} />
            </a>
          </div>

          {/* MISC */}
          <div className="flex justify-end mt-5 -mb-3">
          <p className="text-[9px]">MAINNET | <span>v1.0.0</span></p>
          </div>
        </div>
      </footer>
    </AppProvider>
  );
};

export default App;
