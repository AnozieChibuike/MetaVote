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
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiMail } from "react-icons/ci";
import DedicatedAdminDashboard from "./pages/DedicatedAdminDashboard";
import AdminSignin from "./pages/auth/AdminSignIn";
import WhiteListed from "./pages/WhiteListed";
import VoterSignin from "./pages/auth/VoterSignIn";
import VoterDashboard from "./pages/VoterDashboard";
import NotFound from "./pages/NotFound";
import Verify from "./pages/auth/Verify";
import MiniApp from "./pages/MiniApp";
import DedicatedVotePage from "./pages/DedicatedVotePage";
import DedicatedResultsPage from "./pages/DedicatedResultsPage";
// import { Analytics } from "@vercel/analytics/react"
const App = () => {
  window.document.title = "Meta Vote";
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<DedicatedAdminDashboard />} />
          {/* <Route path="/manage" element={<ManageElection />} /> */}
          <Route path="/whitelist" element={<WhitelistPage />} />
          <Route path="/voters" element={<WhiteListed />} />
          <Route path="/vote" element={<DedicatedVotePage />} />
          <Route path="/results" element={<DedicatedResultsPage />} />
          <Route path="/signin" element={<AdminSignin />} />
          <Route path="/voter-signin" element={<VoterSignin />} />
          <Route path="/voter-dashboard" element={<VoterDashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/mini" element={<MiniApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
