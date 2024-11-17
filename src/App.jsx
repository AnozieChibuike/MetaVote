// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateElectionPage from "./pages/CreateElectionPage";
import WhitelistPage from "./pages/WhitelistPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import AppProvider from "./context/AppContext";
import WalletButton from "./components/WalletButton";
import ManageElection from "./pages/ManageElection";
// import { Magic } from '@magic-sdk/react';

const App = () => {
  return (
  

    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-election" element={<CreateElectionPage />} />
          <Route path="/manage" element={<ManageElection />} />
          <Route path="/whitelist" element={<WhitelistPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
