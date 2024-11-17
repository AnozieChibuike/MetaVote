// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/create-election">Create Election</Link></li>
        <li><Link to="/whitelist">Whitelist</Link></li>
        <li><Link to="/vote">Vote</Link></li>
        <li><Link to="/results">Results</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
